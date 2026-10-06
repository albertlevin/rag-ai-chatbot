import {
    boolean,
    foreignKey,
    json,
    jsonb,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { chat } from "./chat";

// resumable-stream ids per chat
export const stream = pgTable("Stream",
    {
        id: uuid("id").notNull().defaultRandom(),
        chatId: uuid("chatId").notNull(),
        createdAt: timestamp("createdAt").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id] }),
        chatRef: foreignKey({
            columns: [table.chatId],
            foreignColumns: [chat.id]
        }),
    })
)

export type Stream = InferSelectModel<typeof stream>;