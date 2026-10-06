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

export const user = pgTable("User", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    email: varchar("email", { length: 64 }).notNull(),
    password: varchar("password", { length: 64 })
});

export type User = InferSelectModel<typeof user>;