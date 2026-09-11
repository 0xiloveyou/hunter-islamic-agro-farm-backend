import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {


	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			imagePublicId: true,
			imageUrl: true,
		},
	});

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(new Error("No result returned from Cloudinary"));
						}

						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},

		data: {
			imageUrl: cloudinaryResult.secure_url,
			imagePublicId: cloudinaryResult.public_id,
		},

		omit: {
			password: true,
		},
	});

	if (currentUser?.imagePublicId && currentUser.imageUrl) {
		await cloudinary.uploader.destroy(currentUser.imagePublicId);
	}

	return updatedUser;
};
const applyAsShark = async (userId: string) => {
	// First, find the user to confirm existence
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const Updateduser = await prisma.user.update({
		where: { id: userId },
		data: {
			applyAsShark: "PENDING", // Set application status to pending
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			applyAsShark: true,
			imageUrl: true,
			googleId: true,
			// add any other fields you need
		},
	});

	// Return the updated user
	return Updateduser;
};
const bookAppointment = async (
	userId: string,
	scheduleId: string,
	purpose?: string,
	notes?: string,
) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (user.role !== "SHARK") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only sharks can book appointments",
		);
	}

	const schedule = await prisma.schedule.findUnique({
		where: { id: scheduleId },
	});

	if (!schedule) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	if (schedule.isBooked) {
		throw new AppError(httpStatus.CONFLICT, "This schedule is already booked");
	}

	const appointment = await prisma.$transaction(async (tx) => {
		const createdAppointment = await tx.appointment.create({
			data: {
				userId,
				scheduleId,
				purpose,
				notes,
			},
		});

		await tx.schedule.update({
			where: { id: scheduleId },
			data: {
				isBooked: true,
			},
		});

		return createdAppointment;
	});

	return appointment;
};
const getSchedules = async () => {
	const schedules = await prisma.schedule.findMany({
		where: {
			isBooked: false,
		},
		orderBy: {
			scheduledAt: "asc",
		},
	});

	return schedules;
};
export const UserServices = {
	uploadProfileImage,
	applyAsShark,
	bookAppointment,
    getSchedules,
};