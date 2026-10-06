import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId, deleteAllChatsByUserId } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const startingAfter = searchParams.get("starting_after");
    const endingBefore = searchParams.get("ending_before");

    if (startingAfter && endingBefore) {
        return new Response(
            "bad_request:api: Only one of starting_after or ending_before can be provided.",
            { status: 400 }
        );
    }

    const session = await auth();

    if (!session?.user) {
        return new Response("unauthorized:chat", { status: 401 });
    }

    const chats = await getChatsByUserId({
        id: session.user.id,
        limit,
        startingAfter,
        endingBefore,
    });

    return Response.json(chats);
}

export async function DELETE() {
    const session = await auth();

    if (!session?.user) {
        return new Response("unauthorized:chat", { status: 401 });
    }

    const result = await deleteAllChatsByUserId({ userId: session.user.id });

    return Response.json(result, { status: 200 });
}