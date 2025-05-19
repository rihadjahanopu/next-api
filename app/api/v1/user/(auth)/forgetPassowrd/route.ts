import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Helper to send email
async function sendResetEmail(email: string, newPassword: string) {
	// Configure your SMTP transport (use environment variables in production)
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST || "smtp.example.com",
		port: Number(process.env.SMTP_PORT) || 587,
		secure: false,
		auth: {
			user: process.env.SMTP_USER!,
			pass: process.env.SMTP_PASS!,
		},
	});

	await transporter.sendMail({
		from: process.env.SMTP_SERVICE || "no-reply@example.com",
		to: email,
		subject: "Your password has been reset",
		text: `Your new password is: ${newPassword}`,
		html: `<p>Your new password is: <b>${newPassword}</b></p>`,
	});
}

export async function POST(request: NextRequest) {
	try {
		const { email, newPassword } = await request.json();
		if (!email || !newPassword) {
			return NextResponse.json(
				{ error: "Email and new password are required" },
				{ status: 400 }
			);
		}
		const user = await prisma.user.findFirst({ where: { email } });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { email },
			data: { password: hashedPassword },
		});
		await sendResetEmail(email, newPassword);
		return NextResponse.json({
			message: "Password reset successfully and email sent",
		});
	} catch {
		return NextResponse.json(
			{ error: "Failed to reset password" },
			{ status: 500 }
		);
	}
}
