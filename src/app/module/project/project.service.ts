import { prisma } from "../../lib/prisma";

const createProject = async (data: {
	title: string;
	description: string;
	imageUrl?: string;
	location?: string;
	totalCost: number;
	currency?: string;
	startDate?: string;
	endDate?: string;
}) => {
	const project = await prisma.project.create({
		data: {
			title: data.title,
			description: data.description,
			imageUrl: data.imageUrl,
			location: data.location,
			totalCost: data.totalCost,
			currency: data.currency || "USD",
			startDate: data.startDate ? new Date(data.startDate) : undefined,
			endDate: data.endDate ? new Date(data.endDate) : undefined,
		},
	});

	return project;
};

// const getAllProjects = async () => {
// 	const projects = await prisma.project.findMany({
// 		orderBy: {
// 			createdAt: "desc",
// 		},
// 	});

// 	return projects;
// };

// const getProjectById = async (id: string) => {
// 	const project = await prisma.project.findUnique({
// 		where: {
// 			id,
// 		},
// 	});

// 	return project;
// };

export const ProjectServices = {
	createProject,
	// getAllProjects,
	// getProjectById,
};