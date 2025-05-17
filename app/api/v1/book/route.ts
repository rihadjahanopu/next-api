import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all books
export async function GET() {
	try {
		const books = await prisma.book.findMany();
		return NextResponse.json(books);
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
		const { title, author, published } = body;
		if (!title || !author) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}
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
