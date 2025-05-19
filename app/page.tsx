"use client";

import { useState } from "react";

const Home = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/v1/user/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Login failed");
			} else {
				// Optionally redirect or show success
				window.location.reload();
			}
		} catch (err) {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				maxWidth: 400,
				margin: "2rem auto",
				padding: 24,
				border: "1px solid #eee",
				borderRadius: 8,
			}}>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: 12 }}>
					<label>Email</label>
					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={{ width: "100%", padding: 8, marginTop: 4 }}
					/>
				</div>
				<div style={{ marginBottom: 12 }}>
					<label>Password</label>
					<input
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						style={{ width: "100%", padding: 8, marginTop: 4 }}
					/>
				</div>
				{error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
				<button
					type='submit'
					disabled={loading}
					style={{ width: "100%", padding: 10 }}>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>
		</div>
	);
};

export default Home;
