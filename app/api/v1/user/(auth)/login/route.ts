import prisma from "@/app/lib/prisma";
import { loginSchema } from "@/app/validation/book.schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
export const POST = async (request: NextResponse) => {
	try {
		const body = await request.json();
		const parseData = loginSchema.safeParse(body);
		if (!parseData.success) {
			return NextResponse.json(
				{ error: parseData.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { email: parseData.data.email },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		const isValidPassword = await bcrypt.compare(
			parseData.data.password,
			user.password
		);
		if (!isValidPassword) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				name: user.name,
			},
			process.env.JWT_SECRET!,
			{
				expiresIn: "7d",
				audience: ["user"],
			}
		);

		// Set token as HTTP-only cookie
		const response = NextResponse.json({ message: "Login successful" });
		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
		});
		return response;
	} catch (error) {
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
};
