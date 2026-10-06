import { nanoid } from "@/lib/utils"
import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core"
import { resources } from './resources' // import to reference the table

export const embeddings = pgTable(
    'embeddings',
    {
        id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
        resourceId: varchar('resource_id', { length: 191 }).references(
            () => resources.id,
            { onDelete: "cascade" },
        ),
        content: text("content").notNull(),
        embedding: vector("embedding", { dimensions: 1536 }).notNull(), // fixed-length float array
        // OpenAI text-embedding-3-small has 1536 embedding dimensions
    },
    table => ({ // define a vector index on the 'embedding' column
        // index name: embeddingIndex
        // HNSW (Hierarchical Navigable Small World) index type
        // operator class: 'vector_cosine_ops'
        embeddingIndex: index("embeddingIndex").using(
            "hnsw",
            table.embedding.op('vector_cosine_ops'),
        )
    })
)