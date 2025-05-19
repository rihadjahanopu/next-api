// zod Validation schema for book
import { z } from "zod";

export const bookSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	author: z.string().min(1, { message: "Author is required" }),
});
export const bookUpdateSchema = z.object({
	id: z.string().uuid({ message: "Invalid book ID" }),
	title: z.string().min(1, { message: "Title is required" }),
	author: z.string().min(1, { message: "Author is required" }),
});
export const bookDeleteSchema = z.object({
	id: z.string().uuid({ message: "Invalid book ID" }),
});
