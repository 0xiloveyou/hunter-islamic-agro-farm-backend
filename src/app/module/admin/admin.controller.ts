import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getSharkApplications = catchAsync(async (req: Request, res: Response) => {
	const users = await AdminService.getSharkApplications();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Shark applications retrieved successfully",
		data: users,
	});
});

const acceptSharkApplication = catchAsync(
	async (req: Request, res: Response) => {
		const { userId } = req.params;

		const user = await AdminService.acceptSharkApplication(userId as string);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Shark application accepted successfully",
			data: user,
		});
	},
);

const createSchedule = catchAsync(async (req: Request, res: Response) => {
	const { scheduledAt } = req.body;

	const schedule = await AdminService.createSchedule(scheduledAt);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Schedule created successfully",
		data: schedule,
	});
});


export const AdminController = {
	getSharkApplications,
    acceptSharkApplication,
	createSchedule,
};


