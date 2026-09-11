import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { UserController } from "./user.controller";

const router = Router();

router.patch(
	"/profile-image",
	auth(Role.ADMIN, Role.INVESTOR, Role.SHARK),
	upload.single("profileImage"), /// frontend file name key => profileImage
	UserController.uploadProfileImage,
);
router.post(
	"/apply-as-shark",
	auth(Role.ADMIN, Role.INVESTOR),
	UserController.applyAsShark,
);
router.post(
	"/book-appointment",
	auth(Role.SHARK),
	UserController.bookAppointment,
);
export const UserRoutes = router;