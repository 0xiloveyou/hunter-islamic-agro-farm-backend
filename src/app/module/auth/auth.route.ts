import { Router } from 'express'
import { Role } from '../../../generated/prisma/enums'
import { auth } from '../../middleware/checkAuth'
import { AuthController } from './auth.controller'
import { validateRequest } from '../../middleware/validateRequest'
import { UserValidation } from './auth.validation'

const router = Router()

router.post(
	"/register",
	validateRequest(UserValidation.UserRegistrationZodSchema),
	AuthController.registerUser,
);
router.post(
	"/verify-email",
	validateRequest(UserValidation.UserEmailVerifyZodSchema),
	AuthController.verifyUserEmail,
);
router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);
router.post("/google", AuthController.googleLogin);
router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword,
);

router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword,
);

router.get(
    '/me',
    auth(Role.ADMIN, Role.INVESTOR, Role.SHARK),
    AuthController.getMe,
)
router.post('/refresh-token', AuthController.refreshToken)


export const AuthRoutes = router
