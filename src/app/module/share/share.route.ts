import express from "express";

import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { ShareController } from "./share.controller";

const router = express.Router();

router.get(
	"/my-shares",
	auth(Role.INVESTOR, Role.SHARK),
	ShareController.getMyShares,
);

export const ShareRoutes = router;