import prisma from "@/app/lib/prisma";
import { userSchema } from "@/app/validation/book.schema";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Define a type for JWT payload
export type JwtPayload = {
	userId: string;
	email: string;
};

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
		// Hash the password before saving
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { name, email, password: hashedPassword },
		});

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email } as JwtPayload,
			process.env.JWT_SECRET!,
			{
				expiresIn: process.env.JWT_EXPIRES_IN
					? String(process.env.JWT_EXPIRES_IN)
					: "7d",
			} as SignOptions
		);

		// Save token to user in database
		await prisma.user.update({
			where: { id: user.id },
			data: { token },
		});

		// // Remove password from response
		// const { password: _removed, ...userWithoutPassword } = user;
		// // Set token as HTTP-only cookie
		// const response = NextResponse.json({ data: userWithoutPassword });
		// response.cookies.set("token", token, {
		// 	httpOnly: true,
		// 	secure: process.env.NODE_ENV === "production",
		// 	maxAge: 60 * 60 * 24 * 7, // 7 days
		// 	path: "/",
		// });
		// return response;

		//  nextjs cookie seutup

		const response = NextResponse.json({ data: user });
		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});
		response.cookies.set("userId", user.id, {});
		response.cookies.set("email", user.email, {});
		response.cookies.set("name", user.name, {});

		return response;
	} catch {
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}

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
