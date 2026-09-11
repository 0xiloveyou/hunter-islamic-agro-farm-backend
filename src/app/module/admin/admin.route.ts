import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
	"/accept-shark",
	auth(Role.ADMIN),
	AdminController.getSharkApplications,
);

router.patch(
	"/accept-shark/:userId",
	auth(Role.ADMIN),
	AdminController.acceptSharkApplication,
);


router.post(
	"/schedule",
	auth(Role.ADMIN),
	AdminController.createSchedule,
);

export const AdminRoutes = router;