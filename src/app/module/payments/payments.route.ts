import express from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { PaymentController } from "./payments.controller";

const router = express.Router();

router.post(
  "/create-checkout",
  auth(Role.INVESTOR, Role.SHARK),
  PaymentController.createCheckout,
);

// router.get(
//   "/my-payments",
//   auth(Role.INVESTOR, Role.SHARK),
//   PaymentController.getMyPayments,
// );

export const PaymentRoutes = router;

