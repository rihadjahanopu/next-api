// zod Validation schema for book
import { z } from "zod";

export const bookPublishedSchema = z.coerce
	.date()
	.refine((date) => !isNaN(date.getTime()), {
		message: "Invalid published date",
	});

export const bookSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	authorId: z.string().min(1, { message: "AuthorId is required" }),
	published: bookPublishedSchema.optional(),
});
export const bookUpdateSchema = z.object({
	id: z.string().uuid({ message: "Invalid book ID" }),
	title: z.string().min(1, { message: "Title is required" }),
	author: z.string().min(1, { message: "Author is required" }),
});
export const bookDeleteSchema = z.object({
	id: z.string().uuid({ message: "Invalid book ID" }),
});

export const bookQuerySchema = z.object({
	page: z.coerce
		.number()
		.min(1, { message: "Page must be greater than 0" })
		.default(1),
	limit: z.coerce
		.number()
		.min(1, { message: "Limit must be greater than 0" })
		.max(100, { message: "Limit must be less than or equal to 100" })
		.default(10),
});

export const bookSortSchema = z.enum(["asc", "desc"]).default("asc");
export const bookSortBySchema = z
	.enum(["title", "author", "published", "createdAt", "updatedAt"])
	.default("createdAt");

// userSchema
export const userSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});
