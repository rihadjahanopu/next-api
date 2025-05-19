import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "../../../validation/book.schema";

// GET: Fetch all users
export async function GET() {
	try {
		const users = await prisma.user.findMany();
		return NextResponse.json({ data: users });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}
