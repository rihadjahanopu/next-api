import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { bookSchema } from "../../../validation/book.schema";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		let userId = searchParams.get("userId");
		if (!userId || userId === "all") {
			userId = "all";
		}

		const pageParam = searchParams.get("page");
		const limitParam = searchParams.get("limit");
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
		const page = parseInt(pageParam || "1", 10);
		const limit = parseInt(limitParam || "10", 10);
		const skip = (page - 1) * limit;

		let whereClause = {};
		if (userId !== "all") {
			// Validate userId as a MongoDB ObjectId (24 hex chars)
			const isValidObjectId = /^[a-f\d]{24}$/i.test(userId);
			if (!isValidObjectId) {
				return NextResponse.json(
					{
						error: "Invalid user id format. Must be a 24-character hex string.",
					},
					{ status: 400 }
				);
			}
			whereClause = { authorId: userId };
		}

		const [books, total] = await Promise.all([
			prisma.book.findMany({
				where: whereClause,
				skip,
				take: limit,
				orderBy: { [sortBy]: sortOrder },
			}),
			prisma.book.count({ where: whereClause }),
		]);

		const totalPages = Math.ceil(total / limit);
		const booksWithAuthors = await Promise.all(
			books.map(async (book) => {
				const author = await prisma.user.findUnique({
					where: { id: book.authorId },
				});
				return { ...book, author };
			})
		);

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
			data: booksWithAuthors,
		});
	} catch (error) {
		console.error("Book fetch error:", error);
		if (
			(error as { code?: string }).code === "EPERM" ||
			(error as { code?: string }).code === "EACCES"
		) {
			return NextResponse.json(
				{
					error:
						"Operation not permitted. Please check file or directory permissions.",
				},
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ error: "Failed to fetch books", details: (error as Error).message },
			{ status: 500 }
		);
	}
}

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
		const { title, authorId, published } = body;
		const data: { title: string; authorId: string; published?: Date } = {
			title,
			authorId,
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
		const author = await prisma.user.findUnique({
			where: { id: book.authorId },
		});
		return NextResponse.json({ ...book, author }, { status: 201 });
	} catch (error) {
		console.error("Book creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create book", details: (error as Error).message },
			{ status: 500 }
		);
	}
}
