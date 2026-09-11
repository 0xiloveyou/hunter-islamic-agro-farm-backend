import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import path from "path";
import { profile } from "console";

const getSharkApplications = async () => {
	const users = await prisma.user.findMany({
		where: {
			applyAsShark: "PENDING",
		},
		omit: {
			password: true,
		},
	});

	return users;
};

const acceptSharkApplication = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (user.applyAsShark !== "PENDING") {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"User does not have a pending shark application",
		);
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			role: "SHARK",
			applyAsShark: "APPROVED",
		},
		omit: {
			password: true,
		},
	});

	return updatedUser;
};

export const AdminService = {
   getSharkApplications,
   acceptSharkApplication,
};
