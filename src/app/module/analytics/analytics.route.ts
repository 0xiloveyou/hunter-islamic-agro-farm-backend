import express from "express";

import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get("/admin", auth(Role.ADMIN), AnalyticsController.getAdminAnalytics);

export const AnalyticsRoutes = router;