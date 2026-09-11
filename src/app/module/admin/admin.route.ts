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


export const AdminRoutes = router;