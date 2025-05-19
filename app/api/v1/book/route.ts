import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { bookSchema } from "../../../validation/book.schema";

// GET: Fetch all books with or without pagination, sorting, and total count
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const pageParam = searchParams.get("page");
		const limitParam = searchParams.get("limit");
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

		// If no page/limit, return first page with 10 books and total count
		if (!pageParam && !limitParam) {
			const page = 1;
			const limit = 10;
			const skip = 0;
			const [books, total] = await Promise.all([
				prisma.book.findMany({
					skip,
					take: limit,
					orderBy: { [sortBy]: sortOrder },
				}),
				prisma.book.count(),
			]);
			const totalPages = Math.ceil(total / limit);
			return NextResponse.json({
				message: "Book data fetched successfully",
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: false,
				skip,
				data: books,
			});
		}

		// Pagination logic
		const page = parseInt(pageParam || "1", 10);
		const limit = parseInt(limitParam || "10", 10);
		const skip = (page - 1) * limit;

		const [books, total] = await Promise.all([
			prisma.book.findMany({
				skip,
				take: limit,
				orderBy: { [sortBy]: sortOrder },
			}),
			prisma.book.count(),
		]);

		const totalPages = Math.ceil(total / limit);

		return NextResponse.json({
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				skip,
			},
			data: books,
		});
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch books" },
			{ status: 500 }
		);
	}
}

// POST: Create a new book
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const parseResult = bookSchema.safeParse(body);
		if (!parseResult.success) {
			return NextResponse.json(
				{ error: parseResult.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}
		const { title, author, published } = body;
		const data: { title: string; author: string; published?: Date } = {
			title,
			author,
		};
		if (published) {
			const date = new Date(published);
			if (isNaN(date.getTime())) {
				return NextResponse.json(
					{ error: "Invalid published date" },
					{ status: 400 }
				);
			}
			data.published = date;
		}
		const book = await prisma.book.create({ data });
		return NextResponse.json(book, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to create book" },
			{ status: 500 }
		);
	}
}
