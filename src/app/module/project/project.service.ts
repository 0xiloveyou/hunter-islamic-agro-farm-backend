import { ProjectStatus } from "../../../generated/prisma/enums";
import { IQuery } from "../../interface";
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

const getAllProjects = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const sortBy = query.sortBy ? query.sortBy : "createdAt";

	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: any[] = [];

	// Searching
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					title: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					description: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					location: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	// Filtering by status
	if (query.status) {
		andConditions.push({
			status: query.status as ProjectStatus,
		});
	}

	// Filtering by location
	if (query.location) {
		andConditions.push({
			location: {
				contains: query.location,
				mode: "insensitive",
			},
		});
	}

	// Filtering by currency
	if (query.currency) {
		andConditions.push({
			currency: {
				equals: query.currency,
				mode: "insensitive",
			},
		});
	}

	const allProjects = await prisma.project.findMany({
		where: {
			AND: andConditions.length > 0 ? andConditions : undefined,
		},

		take: limit,
		skip: skip,

		orderBy: {
			[sortBy]: sortOrder,
		},
	});

	const totalProjectCount = await prisma.project.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: allProjects,

		meta: {
			page,
			limit,
			total: totalProjectCount,
			totalPages: Math.ceil(totalProjectCount / limit),
		},
	};
};

const getProjectById = async (id: string) => {
	const project = await prisma.project.findUnique({
		where: {
			id,
		},
	});

	return project;
};

export const ProjectServices = {
	createProject,
	getAllProjects,
	getProjectById,
};