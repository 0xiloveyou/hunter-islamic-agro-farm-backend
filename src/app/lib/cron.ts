import cron from "node-cron";
import ejs from "ejs";
import path from "path";

import { ApplyAsSharkStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import { transporter } from "./nodemailer";
import config from "../config";

export const sendSharkApplicationSummary = async () => {
	cron.schedule("0 * * * *", async () => {
		try {
			const totalApplications = await prisma.user.count({
				where: {
					applyAsShark: ApplyAsSharkStatus.PENDING,
				},
			});

			const templatePath = path.join(
				process.cwd(),
				"src/app/templates/shark-application-summary.ejs",
			);

			const templateData = {
				totalApplications,
				generatedAt: new Date(),
			};

			// const html = await ejs.renderFile(templatePath, templateData);

			// await transporter.sendMail({
			// 	from: config.email_sender,
			// 	to: "sifatasif99@gmail.com",
			// 	subject: "Shark Application Summary",
			// 	html,
			// });

			console.log(
				`Cron: Shark application summary sent. Total pending applications: ${totalApplications}`,
			);
		} catch (error) {
			console.error("Cron: Failed to send shark application summary", error);
		}
	});

	console.log("Shark application summary cron scheduled (every 1 hour)");
};