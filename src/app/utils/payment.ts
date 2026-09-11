import Stripe from "stripe";
import config from "../config";
export const stripe = new Stripe(config.stripe_secret_key);
interface CreateCheckoutSessionParams {
	userId: string;
	shareId: string;
	numberOfShares: number;
	pricePerShare: number;
	totalAmount: number;
	customerEmail: string;
}
const createCheckoutSession = async ({
	userId,
	shareId,
	numberOfShares,
	pricePerShare,
	totalAmount,
	customerEmail,
}: CreateCheckoutSessionParams) => {
	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		customer_email: customerEmail,
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: "Investment Share",
						description: `${numberOfShares} share(s) at $${pricePerShare.toLocaleString()} per share`,
					},
					unit_amount: Math.round(pricePerShare * 100),
				},
				quantity: numberOfShares,
			},
		],
		metadata: {
			userId,
			shareId,
			numberOfShares: numberOfShares.toString(),
			pricePerShare: pricePerShare.toString(),
			totalAmount: totalAmount.toString(),
		},
		success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${config.frontend_url}/payment/cancel`,
		payment_intent_data: {
			metadata: { userId, shareId, numberOfShares: numberOfShares.toString() },
		},
	});
	return session;
};
export const PaymentUtils = { createCheckoutSession };