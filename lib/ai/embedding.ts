import { embed, embedMany } from "ai"
import { openai } from "@ai-sdk/openai"
import { db } from '../db'
import { cosineDistance, desc, gt, sql } from "drizzle-orm"
import { embeddings } from "../db/schema/embeddings"

const embeddingModel = openai.embedding('text-embedding-3-small')

const generateChunks = (input: string): string[] => {
    // simple technique: split the input by sentence, ignore empty items.
    return input
        .trim()
        .split('.')
        .filter(i => i !== '')
}

// async function always returns a Promise
// Promise resolves to an array of {embedding: number[], content: string}
export const generateEmbeddings = async (value: string,):
    Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({ // use {embeddings} as object destructuring.
        // embedMany returns other values as well.
        model: embeddingModel,
        values: chunks
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }))
}

// function to generate embeddings for the user query
export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll('\\n', ' '); // replace newlines with spaces
    const { embedding } = await embed({
        model: embeddingModel,
        value: input
    });
    return embedding;
}

// embeds the user's query, searches the DB for similar items, returns relevant items (top 4)
export const findRelevantContent = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
        embeddings.embedding,
        userQueryEmbedded
    )})`; // calculate cosine distance to all embeddings in the database.
    const similarGuides = await db.select({ name: embeddings.content, similarity }).from(embeddings)
        .where(gt(similarity, 0.5))
        .orderBy(t => desc(t.similarity))
        .limit(4);
    return similarGuides;
}