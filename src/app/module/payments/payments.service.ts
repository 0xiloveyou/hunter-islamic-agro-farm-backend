
import httpStatus from "http-status";
import { PaymentStatus, Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { stripe } from "../utils/payment";
import { AppError } from "../errors/AppError";

const createCheckout = async (
  userId: string,
  numberOfShares: number,
) => {
  if (!numberOfShares || numberOfShares < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Number of shares must be at least 1",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  let pricePerShare: number;

  if (user.role === Role.INVESTOR) {
    pricePerShare = 1000;
  } else if (user.role === Role.SHARK) {
    pricePerShare = 50000;
  } else {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only investors and sharks can purchase shares",
    );
  }

  const totalAmount = numberOfShares * pricePerShare;

  const share = await prisma.share.create({
    data: {
      userId,
      numberOfShares,
      pricePerShare,
      totalAmount,
      currency: "USD",
      paymentReceiptUrls: [],
    },
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      shareId: share.id,
      amount: totalAmount,
      currency: "USD",
      status: PaymentStatus.PENDING,
    },
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: user.email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Investment Share",
              description: `${numberOfShares} share(s)`,
            },
            unit_amount: pricePerShare * 100,
          },
          quantity: numberOfShares,
        },
      ],

      metadata: {
        userId,
        shareId: share.id,
        paymentId: payment.id,
        numberOfShares: numberOfShares.toString(),
        pricePerShare: pricePerShare.toString(),
        totalAmount: totalAmount.toString(),
      },

      payment_intent_data: {
        metadata: {
          userId,
          shareId: share.id,
          paymentId: payment.id,
        },
      },

      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        stripeSessionId: session.id,
      },
    });

    return {
      paymentId: payment.id,
      shareId: share.id,
      numberOfShares,
      pricePerShare,
      totalAmount,
      currency: "USD",
      checkoutUrl: session.url,
    };
  } catch (error) {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    throw error;
  }
};




export const PaymentServices = {
  createCheckout,
  getMyPayments,
  handleWebhook,
};
