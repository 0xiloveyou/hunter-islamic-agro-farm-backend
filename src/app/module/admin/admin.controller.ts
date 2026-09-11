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


export const AdminController = {
	getSharkApplications,

};


