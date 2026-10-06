import {
    boolean,
    foreignKey,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { document } from "./document";
import { InferSelectModel } from "drizzle-orm";

export const suggestion = pgTable(
    "Suggestion",
    {
        id: uuid("id").notNull().defaultRandom(),
        documentId: uuid("documentId").notNull(),
        documentCreatedAt: timestamp("documentCreatedAt").notNull(),
        originalText: text("originalText").notNull(),
        suggestedText: text("suggestedText").notNull(),
        description: text("description"),
        isResolved: boolean("isResolved").notNull().default(false),
        userId: uuid("userId")
            .notNull()
            .references(() => user.id),
        createdAt: timestamp("createdAt").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id] }),
        documentRef: foreignKey({
            columns: [table.documentId, table.documentCreatedAt],
            foreignColumns: [document.id, document.createdAt],
        }),
    })
);

export type Suggestion = InferSelectModel<typeof suggestion>;