import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { dev } from "$app/environment";
import type { Cookies } from "@sveltejs/kit";
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	ROBEK,
	GOOGLE_CLIENT_ID_DEV,
	GOOGLE_CLIENT_SECRET_DEV,
} from "$env/static/private";
import { Google } from "arctic";

export interface Session {
	id: string;
	userId: number;
	expiresAt: number;
}
export function google() {
	if (dev) {
		return new Google(
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			"http://localhost:5173/login/google/callback")
	}
	if (ROBEK === "ROBEK_DEV") {
		return new Google(
			GOOGLE_CLIENT_ID_DEV,
			GOOGLE_CLIENT_SECRET_DEV,
			"http://localhost:8787/login/google/callback"
		)

	}
	return new Google(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		"https://bottomgear.uhlo.workers.dev/login/google/callback"
	);
}

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}


export async function createSession(env: Env, token: string, userId: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: (Date.now() + 1000 * 60 * 60 * 24 * 100)
	};
	const keyValue = env.BOTTOM_GEAR_SESSIONS
	await keyValue.put(`session:${sessionId}`, JSON.stringify(session))
	return session;
}

export async function validateSessionToken(env: Env, token: string): Promise<Session | null> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const keyValue = env.BOTTOM_GEAR_SESSIONS
	const item = await keyValue.get(`session:${sessionId}`);
	if (item === null || item === undefined) {
		return null;
	}

	const result = JSON.parse(item);
	const session: Session = {
		id: result.id,
		userId: result.userId,
		expiresAt: (result.expiresAt * 1000)
	};
	if (Date.now() >= session.expiresAt) {
		await keyValue.delete(`session:${sessionId}`);
		return null;
	}
	if (Date.now() >= session.expiresAt - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = (Date.now() + 1000 * 60 * 60 * 24 * 100);
		await keyValue.put(
			`session:${session.id}`,
			JSON.stringify({
				id: session.id,
				userId: session.userId,
				expiresAt: Math.floor(session.expiresAt / 1000)
			}),
		);
	}
	return session;
}

export async function invalidateSession(env: Env, sessionId: string): Promise<void> {
	await env.BOTTOM_GEAR_SESSIONS.delete(`session:${sessionId}`);
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: number): void {
	const expires = new Date(expiresAt)
	if (!dev) {
		// When deployed over HTTPS
		cookies.set("session", token, { httpOnly: true, sameSite: "lax", expires, secure: true, path: "/" });
	} else {
		// When deployed over HTTP (localhost)
		cookies.set("session", token, { httpOnly: true, sameSite: "lax", expires, path: "/" });
	}
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
	cookies.delete("session", { path: "/" })
}
