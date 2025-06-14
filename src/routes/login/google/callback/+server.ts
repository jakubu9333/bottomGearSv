import { generateSessionToken, createSession, setSessionTokenCookie, google } from "$lib/server/auth";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import { createUserWithGoogleId, getUserByGoogleId } from "$lib/server/db/user";

export async function GET(event: RequestEvent): Promise<Response> {
    const googleAuth = google()
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");
    const storedState = event.cookies.get("google_oauth_state") ?? null;
    const codeVerifier = event.cookies.get("google_code_verifier") ?? null;
    if (code === null || state === null || storedState === null || codeVerifier === null) {
        return new Response(null, {
            status: 400
        });
    }
    if (state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        // Invalid code or client credentials
        return new Response(null, {
            status: 400
        });
    }

    if (event.platform === undefined) {
        return new Response(null, {
            status: 400
        });
    }
    const claims = decodeIdToken(tokens.idToken());
    const googleUserId = claims.sub;
    const username = claims.name;

    const existingUser = await getUserByGoogleId(event.platform.env, googleUserId);

    if (existingUser !== undefined) {
        const sessionToken = generateSessionToken();
        const session = await createSession(event.platform.env, sessionToken, existingUser.id);
        setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
        return new Response(null, {
            status: 303,
            headers: {
                Location: "/"
            }
        });
    }

    const user = await createUserWithGoogleId(event.platform.env, googleUserId, username);

    const sessionToken = generateSessionToken();
    const session = await createSession(event.platform.env, sessionToken, user.id);
    setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
    return new Response(null, {
        status: 303,
        headers: {
            Location: "/username"
        }
    });
}
