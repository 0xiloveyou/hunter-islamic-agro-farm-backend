import { prisma } from "../../lib/prisma";
import {
	PaymentStatus,
	ProjectStatus,
	Role,
} from "../../../generated/prisma/enums";

const getAdminAnalytics = async () => {
	const [
		totalUsers,
		totalInvestors,
		totalSharks,
		totalAdmins,

		totalProjects,
		totalShares,

		totalPayments,
		verifiedPayments,
		pendingPayments,
		failedPayments,
		refundedPayments,

		pendingSharkApplications,
		approvedSharkApplications,

		totalPaymentAmount,
		verifiedPaymentAmount,

		projectCost,
		projectFundedAmount,

		draftProjects,
		fundingProjects,
		fundedProjects,
		inProgressProjects,
		completedProjects,
		cancelledProjects,
	] = await Promise.all([
		// USERS
		prisma.user.count(),

		prisma.user.count({
			where: { role: Role.INVESTOR },
		}),

		prisma.user.count({
			where: { role: Role.SHARK },
		}),

		prisma.user.count({
			where: { role: Role.ADMIN },
		}),

		// PROJECTS
		prisma.project.count(),

		// SHARES
		prisma.share.aggregate({
			_sum: {
				numberOfShares: true,
			},
		}),

		// PAYMENTS
		prisma.payment.count(),

		prisma.payment.count({
			where: { status: PaymentStatus.VERIFIED },
		}),

		prisma.payment.count({
			where: { status: PaymentStatus.PENDING },
		}),

		prisma.payment.count({
			where: { status: PaymentStatus.FAILED },
		}),

		prisma.payment.count({
			where: { status: PaymentStatus.REFUNDED },
		}),

		// SHARK APPLICATIONS
		prisma.user.count({
			where: { applyAsShark: "PENDING" },
		}),

		prisma.user.count({
			where: { applyAsShark: "APPROVED" },
		}),

		// ALL PAYMENT AMOUNTS
		prisma.payment.aggregate({
			_sum: {
				amount: true,
			},
		}),

		// VERIFIED PAYMENT AMOUNTS
		prisma.payment.aggregate({
			_sum: {
				amount: true,
			},
			where: {
				status: PaymentStatus.VERIFIED,
			},
		}),

		// PROJECT FUNDING
		prisma.project.aggregate({
			_sum: {
				totalCost: true,
			},
		}),

		prisma.project.aggregate({
			_sum: {
				fundedAmount: true,
			},
		}),

		// PROJECT STATUS
		prisma.project.count({
			where: { status: ProjectStatus.DRAFT },
		}),

		prisma.project.count({
			where: { status: ProjectStatus.FUNDING },
		}),

		prisma.project.count({
			where: { status: ProjectStatus.FUNDED },
		}),

		prisma.project.count({
			where: { status: ProjectStatus.IN_PROGRESS },
		}),

		prisma.project.count({
			where: { status: ProjectStatus.COMPLETED },
		}),

		prisma.project.count({
			where: { status: ProjectStatus.CANCELLED },
		}),
	]);

	// SHARES
	const totalSharesPurchased = totalShares._sum.numberOfShares ?? 0;

	// PAYMENT AMOUNTS
	const totalInvestmentAmount = Number(totalPaymentAmount._sum.amount ?? 0);

	const totalVerifiedInvestmentAmount = Number(
		verifiedPaymentAmount._sum.amount ?? 0,
	);

	// PROJECT AMOUNTS
	const totalProjectCost = Number(projectCost._sum.totalCost ?? 0);

	const totalProjectFundedAmount = Number(
		projectFundedAmount._sum.fundedAmount ?? 0,
	);

	const fundingPercentage =
		totalProjectCost > 0
			? Number(((totalProjectFundedAmount / totalProjectCost) * 100).toFixed(2))
			: 0;

	return {
		users: {
			total: totalUsers,
			investors: totalInvestors,
			sharks: totalSharks,
			admins: totalAdmins,
		},

		shares: {
			totalPurchased: totalSharesPurchased,
		},

		payments: {
			total: totalPayments,
			verified: verifiedPayments,
			pending: pendingPayments,
			failed: failedPayments,
			refunded: refundedPayments,
		},

		investments: {
			totalAmount: totalInvestmentAmount,
			verifiedAmount: totalVerifiedInvestmentAmount,
			currency: "USD",
		},

		sharkApplications: {
			pending: pendingSharkApplications,
			approved: approvedSharkApplications,
		},

		projects: {
			total: totalProjects,
			totalCost: totalProjectCost,
			fundedAmount: totalProjectFundedAmount,
			fundingPercentage,

			status: {
				draft: draftProjects,
				funding: fundingProjects,
				funded: fundedProjects,
				inProgress: inProgressProjects,
				completed: completedProjects,
				cancelled: cancelledProjects,
			},
		},
	};
};

export const AnalyticsServices = {
	getAdminAnalytics,
};