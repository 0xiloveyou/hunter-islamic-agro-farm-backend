import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentServices } from "./payments.service";
import { sendResponse } from "../../utils/sendResponse";

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

// const getMyPayments = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user?.userId;

//     const result = await PaymentServices.getMyPayments(userId as string);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Payment history retrieved successfully",
//       data: result,
//     });
//   },
// );

export const PaymentController = {
  createCheckout,
  // getMyPayments,
};

