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
router.post('/login', AuthController.loginUser)
router.post("/google", AuthController.googleLogin);

// router.get(
//     '/me',
//     auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
//     AuthController.getMe,
// )
// router.post('/refresh-token', AuthController.refreshToken)

export const AuthRoutes = router
