import bcrypt from 'bcryptjs'
import { JwtPayload, SignOptions } from 'jsonwebtoken'
import { Role, UserStatus } from '../../../generated/prisma/enums'
import config from '../../config'
import { prisma } from '../../lib/prisma'
import { jwtUtils } from '../../utils/jwt'
import {
    IGoogleLoginPayload,
    ILoginUserPayload,
    IRegisterUserPayload,
} from './auth.interface'
import { TokenPayload } from 'google-auth-library'
import { googleClient } from '../../lib/googleAuth'
import { AppError } from '../../utils/AppError'
import httpStatus from "http-status";

const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, password} = payload
    const email = payload.email.trim().toLowerCase()

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    })

    if (isUserExists) {
        throw new Error('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: Role.INVESTOR,
            status: UserStatus.ACTIVE,
            emailVerified: false,
            profile: {
                create: {name,  email },
            },
        },
        omit: { password: true },
        include: { profile: true },
    })

    const {profile, ...user } = createdUser
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        user,
        profile,
        accessToken,
        refreshToken
    }
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { password } = payload
    const email = payload.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        throw new Error('User not found')
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new Error('User is blocked')
    }

    if (user.isDeleted || user.status === UserStatus.DELETED) {
        throw new Error('User is deleted')
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        throw new Error('Invalid credentials')
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    }
}

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google ID Token Verification Failed", error);
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid Or Expired Google Id Token",
		);
	}

	if (!googleIdTokenPayload) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid Or Expired Google Id Token",
		);
	}

	if (!googleIdTokenPayload.email) {
		throw new AppError(httpStatus.BAD_REQUEST, "Google Email Not Found");
	}
	if (!googleIdTokenPayload.name) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Google Email User Name Not Found",
		);
	}

	const ifUserExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			googleId: googleIdTokenPayload.sub, // here .sub contains unique google id of user
		},
	});

	let user = ifUserExistWithGoogleAuth;

	if (!ifUserExistWithGoogleAuth) {
		const ifUserExistWithCredentials = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				authProvider: AuthProvider.CREDENTIAL,
			},
		});

		if (ifPatientExistWithCredentials) {
			if (!ifPatientExistWithCredentials.emailVerified) {
				throw new AppError(httpStatus.FORBIDDEN, "Email Not Verified");
			}

			if (ifPatientExistWithCredentials.status === UserStatus.BLOCKED) {
				throw new AppError(httpStatus.FORBIDDEN, "User Is Blocked");
			}

			if (
				ifPatientExistWithCredentials.isDeleted ||
				ifPatientExistWithCredentials.status === UserStatus.DELETED
			) {
				throw new AppError(httpStatus.FORBIDDEN, "User Is Deleted");
			}

			user = await prisma.user.update({
				where: {
					id: ifPatientExistWithCredentials.id,
				},

				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			// Google Register
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.PATIENT,
					googleId: googleIdTokenPayload.sub,
					authProvider: AuthProvider.GOOGLE,
					emailVerified: true,
					patient: {
						create: {
							name: googleIdTokenPayload.name,
							email: googleIdTokenPayload.email,
						},
					},
				},
			});
			const tempatePath = path.join(
				process.cwd(),
				"src/app/templates/patient-welcome-email.ejs",
			);

			const templateData = {
				name: user.name,
			};

			const html = await ejs.renderFile(tempatePath, templateData);

			await transporter.sendMail({
				from: config.email_sender,
				to: user.email,
				subject: "Welcome To PH Healthcare System",
				// text : `Your OTP is ${otp}`
				// html: `<h1>Your OTP is ${otp}</h1>`
				html,
			});
		}
	}

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new AppError(httpStatus.FORBIDDEN, "User Is Blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new AppError(httpStatus.FORBIDDEN, "User Is Deleted");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};


// const getMe = async (user: IRequestUser) => {
//     const isUserExists = await prisma.user.findUnique({
//         where: {
//             id: user.userId,
//         },
//         include: {
//             patient: true,
//         },
//         omit: {
//             password: true,
//         },
//     })

//     if (!isUserExists) {
//         throw new Error('User not found')
//     }

//     return isUserExists
// }

// const refreshToken = async (token: string) => {
//     const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret)

//     if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
//         throw new Error(config.node_env === 'development' ? verifiedRefreshToken.error : 'Invalid refresh token')
//     }

//     const data = verifiedRefreshToken.data as JwtPayload

//     const user = await prisma.user.findUnique({
//         where: { id: data.userId },
//     })

//     if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
//         throw new Error('User is inactive or not found')
//     }

//     const jwtPayload = {
//         userId: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//     }

//     const accessToken = jwtUtils.createToken(
//         jwtPayload,
//         config.jwt_access_secret,
//         config.jwt_access_expires_in as SignOptions
//     );

//     const refreshToken = jwtUtils.createToken(
//         jwtPayload,
//         config.jwt_refresh_secret,
//         config.jwt_refresh_expires_in as SignOptions
//     );

//     return {
//         accessToken,
//         refreshToken
//     }
// }



export const AuthService = {
    registerUser,
    loginUser,
    // getMe,
    // refreshToken
}
