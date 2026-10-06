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
import { user } from "./user";
import { AppUsage } from "@/lib/usage";

export const chat = pgTable("Chat", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    userId: uuid("userId").notNull().references(() => user.id),
    visibility: varchar("visibility", { enum: ["public", "private"] }).notNull().default("private"),
    lastContext: jsonb("lastContext").$type<AppUsage | null>(),
})

export type Chat = InferSelectModel<typeof chat>;