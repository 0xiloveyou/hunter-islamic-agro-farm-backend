import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProjectServices } from "./project.service";

const createProject = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectServices.createProject(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Project created successfully",
		data: result,
	});
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectServices.getAllProjects();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Projects retrieved successfully",
		data: result,
	});
});

const getProjectById = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectServices.getProjectById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Project retrieved successfully",
		data: result,
	});
});

export const ProjectController = {
	createProject,
	getAllProjects,
	getProjectById,
};