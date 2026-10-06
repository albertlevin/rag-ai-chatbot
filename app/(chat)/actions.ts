"use server";

import type { VisibilityType } from "@/components/visibility-selector";
import { updateChatVisibilityById } from "@/lib/db/queries";

export async function updateChatVisibility({
    chatId,
    visibility,
}: {
    chatId: string;
    visibility: VisibilityType;
}) {
    await updateChatVisibilityById({ chatId, visibility });
}