import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentServices } from "./payments.service";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";

const createCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { numberOfShares } = req.body;

    const result = await PaymentServices.createCheckout(
      userId as string,
      Number(numberOfShares),
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  },
);
const webhook = catchAsync(async (req: Request, res: Response) => {
	const signature = req.headers["stripe-signature"];

	if (!signature) {
		throw new AppError(httpStatus.BAD_REQUEST, "Stripe signature is missing");
	}

	await PaymentServices.handleWebhook(req.body);

	res.status(httpStatus.OK).json({
		received: true,
	});
});
const getMyPayments = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const result = await PaymentServices.getMyPayments(userId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment history retrieved successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  createCheckout,
  getMyPayments,
  webhook,
};

