import httpStatus from "http-status";
import ejs from "ejs";
import path from "path";
import PDFDocument from "pdfkit";

import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import { stripe } from "../../lib/stripe";
import { transporter } from "../../lib/nodemailer";
import config from "../../config";

const createCheckout = async (userId: string, numberOfShares: number) => {
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
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
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

/**
 * Generate investment payment PDF
 */
const generatePaymentReceiptPdf = async (payment: {
	id: string;
	amount: any;
	currency: string;
	transactionId: string | null;
	stripeSessionId: string | null;
	stripePaymentIntentId: string | null;
	status: PaymentStatus;
	paidAt: Date | null;
	share: {
		id: string;
		numberOfShares: number;
		pricePerShare: any;
		totalAmount: any;
	};
	user: {
		id: string;
		name: string;
		email: string;
	};
}): Promise<Buffer> => {
	const pdfDocument = new PDFDocument({
		margin: 50,
	});

	const pdfChunks: Buffer[] = [];

	pdfDocument.on("data", (chunk: Buffer) => {
		pdfChunks.push(chunk);
	});

	const pdfReadyPromise = new Promise<Buffer>((resolve, reject) => {
		pdfDocument.on("end", () => {
			resolve(Buffer.concat(pdfChunks));
		});

		pdfDocument.on("error", reject);
	});

	pdfDocument.fontSize(22).text("Investment Payment Receipt", {
		align: "center",
	});

	pdfDocument.moveDown();

	pdfDocument.fontSize(14).text("Investment Transaction Details", {
		align: "center",
	});

	pdfDocument.moveDown(2);

	pdfDocument.fontSize(12).text(`Investor Name: ${payment.user.name}`);

	pdfDocument.text(`Investor Email: ${payment.user.email}`);

	pdfDocument.moveDown();

	pdfDocument.text(`Share ID: ${payment.share.id}`);

	pdfDocument.text(`Number of Shares: ${payment.share.numberOfShares}`);

	pdfDocument.text(
		`Price Per Share: ${payment.currency} ${payment.share.pricePerShare}`,
	);

	pdfDocument.text(
		`Total Investment: ${payment.currency} ${payment.share.totalAmount}`,
	);

	pdfDocument.moveDown();

	pdfDocument.text(`Payment ID: ${payment.id}`);

	pdfDocument.text(`Transaction ID: ${payment.transactionId ?? "N/A"}`);

	pdfDocument.text(
		`Stripe Payment Intent ID: ${payment.stripePaymentIntentId ?? "N/A"}`,
	);

	pdfDocument.text(
		`Stripe Checkout Session ID: ${payment.stripeSessionId ?? "N/A"}`,
	);

	pdfDocument.text(`Payment Status: ${payment.status}`);

	pdfDocument.text(`Amount Paid: ${payment.currency} ${payment.amount}`);

	pdfDocument.text(
		`Paid At: ${payment.paidAt ? payment.paidAt.toISOString() : "N/A"}`,
	);

	pdfDocument.moveDown(2);

	pdfDocument
		.fontSize(10)
		.text(
			"This document serves as an official payment receipt for the investment transaction.",
			{
				align: "left",
			},
		);

	pdfDocument.moveDown();

	pdfDocument.text("Thank you for your investment.", {
		align: "center",
	});

	pdfDocument.end();

	return pdfReadyPromise;
};

/**
 * Handle Stripe webhook
 */
const handleWebhook = async (event: any) => {
	if (event.type !== "checkout.session.completed") {
		return;
	}

	const session = event.data.object;

	const paymentId = session.metadata?.paymentId;
	const shareId = session.metadata?.shareId;

	if (!paymentId || !shareId) {
		return;
	}

	/**
	 * Find payment with related share and user
	 */
	const payment = await prisma.payment.findUnique({
		where: {
			id: paymentId,
		},

		include: {
			share: true,
			user: true,
		},
	});

	if (!payment) {
		return;
	}

	/**
	 * Prevent duplicate processing
	 */
	if (payment.status === PaymentStatus.VERIFIED) {
		return;
	}

	/**
	 * Stripe Payment Intent ID
	 */
	const paymentIntentId =
		typeof session.payment_intent === "string"
			? session.payment_intent
			: session.payment_intent?.id;

	/**
	 * Update payment
	 */
	const updatedPayment = await prisma.payment.update({
		where: {
			id: paymentId,
		},

		data: {
			status: PaymentStatus.VERIFIED,

			transactionId: paymentIntentId ?? null,

			stripePaymentIntentId: paymentIntentId ?? null,

			stripeSessionId: session.id,

			paidAt: new Date(),
		},

		include: {
			share: true,
			user: true,
		},
	});

// 	/**
// 	 * Generate PDF receipt
// 	 */
// 	const pdfBuffer = await generatePaymentReceiptPdf(updatedPayment);

// 	/**
// 	 * Render EJS email
// 	 */
// 	const templatePath = path.join(
// 		process.cwd(),
// 		"src/app/templates/investment-payment-success.ejs",
// 	);

// 	const templateData = {
// 		name: updatedPayment.user.name,

// 		email: updatedPayment.user.email,

// 		numberOfShares: updatedPayment.share.numberOfShares,

// 		pricePerShare: updatedPayment.share.pricePerShare,

// 		totalAmount: updatedPayment.share.totalAmount,

// 		currency: updatedPayment.currency,

// 		transactionId: updatedPayment.transactionId ?? "N/A",

// 		stripeSessionId: updatedPayment.stripeSessionId ?? "N/A",

// 		paidAt: updatedPayment.paidAt
// 			? updatedPayment.paidAt.toLocaleString()
// 			: "N/A",
// 	};

// 	const html = await ejs.renderFile(templatePath, templateData);

// 	/**
// 	 * Send email with PDF attachment
// 	 */
// 	await transporter.sendMail({
// 		from: config.email_sender,

// 		to: updatedPayment.user.email,

// 		subject: "Congratulations! Your Investment Payment Was Successful",

// 		text: `
// Congratulations ${updatedPayment.user.name}!

// Your investment payment has been successfully completed.

// Number of Shares: ${updatedPayment.share.numberOfShares}
// Total Amount: ${updatedPayment.currency} ${updatedPayment.share.totalAmount}
// Transaction ID: ${updatedPayment.transactionId ?? "N/A"}

// Your payment receipt is attached to this email.
//     `,

// 		html,

// 		attachments: [
// 			{
// 				filename: `investment-payment-receipt-${updatedPayment.id}.pdf`,
// 				content: pdfBuffer,
// 				contentType: "application/pdf",
// 			},
// 		],
// 	});

// 	console.log(
// 		`Investment payment verified and receipt emailed to ${updatedPayment.user.email}`,
// 	);
};

const getMyPayments = async (userId: string) => {
	const payments = await prisma.payment.findMany({
		where: {
			userId,
		},

		include: {
			share: true,
		},

		orderBy: {
			createdAt: "desc",
		},
	});

	return payments;
};

export const PaymentServices = {
	createCheckout,
	getMyPayments,
	handleWebhook,
};