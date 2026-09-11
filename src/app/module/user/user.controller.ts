import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new AppError(httpStatus.BAD_REQUEST, "No File Provided.");
	}

	const userId = req.user?.userId;

	const result = await UserServices.uploadProfileImage(
		req.file?.buffer,
		userId!,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Profile image added Successfully",
		data: result,
	});
});
export const applyAsShark = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId;

	// Call service to update application status
	const user = await UserServices.applyAsShark(userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application submitted. Awaiting admin review.",
		data: user,
	});
});
const bookAppointment = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user.userId;
	const { scheduleId, purpose, notes } = req.body;

	const appointment = await UserServices.bookAppointment(
		userId,
		scheduleId,
		purpose,
		notes,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Appointment booked successfully",
		data: appointment,
	});
});
export const UserController = {
	uploadProfileImage,
	applyAsShark,
	bookAppointment,
};