import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ShareServices } from "./share.service";

const getMyShares = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId;

	const result = await ShareServices.getMyShares(userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Share information retrieved successfully",
		data: result,
	});
});

export const ShareController = {
	getMyShares,
};