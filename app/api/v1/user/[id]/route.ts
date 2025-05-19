import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch user by id in the URL
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
		// Fetch user by id
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ data: user });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 }
		);
	}
}
