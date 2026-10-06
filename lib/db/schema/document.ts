import {
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import { user } from "./user"

export const document = pgTable(
    "Document",
    {
        id: uuid("id").notNull().defaultRandom(),
        createdAt: timestamp("createdAt").notNull(),
        title: text("title").notNull(),
        content: text("content"),
        kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
            .notNull()
            .default("text"),
        userId: uuid("userId")
            .notNull()
            .references(() => user.id),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.id, table.createdAt] }),
        };
    }
);