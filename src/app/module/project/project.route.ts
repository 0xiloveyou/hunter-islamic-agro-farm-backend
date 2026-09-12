import express from "express";

import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { ProjectController } from "./project.controller";

const router = express.Router();

/**
 * Admin
 * Create a new project
 */
router.post("/", auth(Role.ADMIN), ProjectController.createProject);

/**
 * Public
 * Get all projects
 */
router.get("/", ProjectController.getAllProjects);

// /**
//  * Public
//  * Get single project
//  */
// router.get("/:id", ProjectController.getProjectById);

export const ProjectRoutes = router;