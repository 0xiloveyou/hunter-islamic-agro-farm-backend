import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";

import { AnalyticsServices } from "./analytics.service";
import { sendResponse } from "../../utils/sendResponse";

const getAdminAnalytics = catchAsync(async (req, res) => {
	const result = await AnalyticsServices.getAdminAnalytics();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin analytics retrieved successfully",
		data: result,
	});
});

export const AnalyticsController = {
	getAdminAnalytics,
};