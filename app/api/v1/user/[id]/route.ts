import prisma from "@/app/lib/prisma";
import { userSchema } from "@/app/validation/book.schema";
import { NextRequest, NextResponse } from "next/server";

// POST: Create a new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const parseResult = userSchema.safeParse(body);
		if (!parseResult.success) {
			return NextResponse.json(
				{ error: parseResult.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}
		const { name, email, password } = body;
		const user = await prisma.user.create({ data: { name, email, password } });
		return NextResponse.json(user, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}

// GET: Fetch all books for a user by id in the URL
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const userId = params.id;
		if (!userId) {
			return NextResponse.json(
				{ error: "Missing user id in URL" },
				{ status: 400 }
			);
		}
		// Validate user exists
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		const books = await prisma.book.findMany({
			where: { authorId: userId },
			include: { author: true },
		});
		return NextResponse.json({ data: books });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch books for user" },
			{ status: 500 }
		);
	}
}
