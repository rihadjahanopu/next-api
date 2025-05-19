import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { bookSchema } from "../../../../validation/book.schema";

// GET: Get a book by id
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	try {
		const book = await prisma.book.findUnique({ where: { id } });
		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}
		return NextResponse.json(book);
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch book" },
			{ status: 500 }
		);
	}
}

// PUT: Update a book by id
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
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
		const updatedBook = await prisma.book.update({ where: { id }, data });
		return NextResponse.json(updatedBook);
	} catch {
		return NextResponse.json(
			{ error: "Failed to update book" },
			{ status: 500 }
		);
	}
}

// DELETE: Delete a book by id
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	try {
		await prisma.book.delete({ where: { id } });
		return NextResponse.json({ message: "Book deleted successfully" });
	} catch {
		return NextResponse.json(
			{ error: "Failed to delete book" },
			{ status: 500 }
		);
	}
}
