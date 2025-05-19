import { NextResponse } from "next/server";

export async function POST() {
	// Remove the token cookie by setting it to empty and expiring it
	const response = NextResponse.json({ message: "Logout successful" });
	response.cookies.set("token", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
	return response;
}
