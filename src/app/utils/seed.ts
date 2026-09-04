import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import {  Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";

//create tester admin
export const seedTesterAdmin = async () => {
	try {
		const isTesterAdminExist = await prisma.user.findUnique({
			where: {
				email: config.tester_admin_email,
			},
		});

		if (isTesterAdminExist) {
			console.log("Tester Admin Already Exists!");
			return;
		}

		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Admin Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.ADMIN,
				needPasswordChange: false,
				emailVerified: true,
				profile: {
					create: { name, email },
				},
			},
		});

		console.log("Tester Admin Created : ", testerAdmin);
	} catch (error) {
		console.log("Error Seeding Tester Admin : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_admin_email,
			},
		});
	}
};

//create tester investor
export const seedTesterInvestor = async () => {
	try {
		const isTesterInvestorExist = await prisma.user.findUnique({
			where: {
				email: config.tester_investor_email,
			},
		});

		if (isTesterInvestorExist) {
			console.log("Tester Investor Already Exists!");
			return;
		}

		const name = config.tester_investor_name;
		const email = config.tester_investor_email;
		const password = config.tester_investor_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester investor Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerInvestor = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.INVESTOR,
				needPasswordChange: false,
				emailVerified: true,
				profile: {
					create: { name, email },
				},
			},
		});

		console.log("Tester Investor Created : ", testerInvestor);
	} catch (error) {
		console.log("Error Seeding Tester investor : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_investor_email,
			},
		});
	}
};
