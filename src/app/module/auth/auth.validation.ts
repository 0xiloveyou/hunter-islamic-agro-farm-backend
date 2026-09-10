import { profile } from "node:console";
import z from "zod";

const UserRegistrationZodSchema = z.object({
	name: z
		.string("Not A String!!!!!")
		.min(3, "Name must atleast 3 characters long!!!")
		.max(10, "Name must be at most 10 characters long"),
	email: z.email("Not email!!"),
	password: z
		.string()
		.min(8, "Password Must Minimum 8 Characters Long.")
		.regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
		.regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
		.regex(/[0-9]/, "Password must contain atleast 1 Number")
		.regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
	profile: z
		.object({
			name: z.string().optional(),
			email: z.email("Invalid email format"),
			phone: z.string().optional(),
			country: z.string().optional(),
			address: z.string().optional(),
			bio: z.string().optional(),
		})
		.optional(), // Making profile optional if needed
});

const LoginZodSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(8, "Password Must Minimum 8 Characters Long.")
		.regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
		.regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

		.regex(/[0-9]/, "Password must contain atleast 1 Number")
		.regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
});

const ForgotPasswordZodSchema = z.object({
	email: z.email(),
});


export const UserValidation = {
	UserRegistrationZodSchema,
	// PatientEmailVerifyZodSchema,
	LoginZodSchema,
	ForgotPasswordZodSchema,
	// ResetPasswordZodSchema,
};