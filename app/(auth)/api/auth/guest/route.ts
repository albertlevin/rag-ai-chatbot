import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signIn } from "@/app/(auth)/auth";
import { env } from "@/lib/env.mjs";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get("redirectUrl") || "/";

    const token = await getToken({
        req: request,
        secret: env.AUTH_SECRET,
        secureCookie: true
    })

    if (token) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return signIn("guest", { redirect: true, redirectTo: redirectUrl })

}