import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { bookSchema } from "../../../../validation/book.schema";


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

		const authorIdValue =
			(book as { authorId?: string; author?: string }).authorId ||
			(book as { author?: string }).author;
		let author = null;
		if (authorIdValue) {
			author = await prisma.user.findUnique({ where: { id: authorIdValue } });
		}
		return NextResponse.json({ ...book, author });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch book" },
			{ status: 500 }
		);
	}
}


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
		const updatedBook = await prisma.book.update({ where: { id }, data });
		const authorIdValue =
			(updatedBook as { authorId?: string; author?: string }).authorId ||
			(updatedBook as { author?: string }).author;
		let author = null;
		if (authorIdValue) {
			author = await prisma.user.findUnique({ where: { id: authorIdValue } });
		}
		return NextResponse.json({ ...updatedBook, author });
	} catch {
		return NextResponse.json(
			{ error: "Failed to update book" },
			{ status: 500 }
		);
	}
}


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
