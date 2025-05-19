import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { email, oldPassword, newPassword } = await request.json();
		if (!email || !oldPassword || !newPassword) {
			return NextResponse.json(
				{ error: "Email, old password, and new password are required" },
				{ status: 400 }
			);
		}
		const user = await prisma.user.findFirst({ where: { email } });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return NextResponse.json(
				{ error: "Old password is incorrect" },
				{ status: 401 }
			);
		}
		if (oldPassword === newPassword) {
			return NextResponse.json(
				{ error: "New password must be different from old password" },
				{ status: 400 }
			);
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { email },
			data: { password: hashedPassword },
		});
		return NextResponse.json({ message: "Password changed successfully" });
	} catch {
		return NextResponse.json(
			{ error: "Failed to change password" },
			{ status: 500 }
		);
	}
}
