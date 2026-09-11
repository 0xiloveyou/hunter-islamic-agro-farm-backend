import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const getMyShares = async (userId: string) => {
	const shares = await prisma.share.findMany({
		where: {
			userId,
			payments: {
				some: {
					status: PaymentStatus.VERIFIED,
				},
			},
		},
		include: {
			payments: {
				where: {
					status: PaymentStatus.VERIFIED,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	const totalShares = shares.reduce(
		(total, share) => total + share.numberOfShares,
		0,
	);

	const totalInvested = shares.reduce(
		(total, share) => total + Number(share.totalAmount),
		0,
	);

	return {
		totalShares,
		totalInvested,
		currency: "USD",
		shares,
	};
};

export const ShareServices = {
	getMyShares,
};