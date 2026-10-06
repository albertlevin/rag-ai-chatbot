'use server';
// server action can be called anywhere in our Next.js application.

import {
    NewResourceParams,
    insertResourceSchema,
    resources,
} from "@/lib/db/schema/resources"

import { db } from '../db'
import { generateEmbeddings } from "../ai/embedding";
import { embeddings as embeddingsTable } from "../db/schema/embeddings";

export const createResource = async (input: NewResourceParams) => {
    try {
        const { content } = insertResourceSchema.parse(input);
        const [resource] = await db
            .insert(resources)
            .values({ content })
            .returning(); // return all fields
        const embeddings = await generateEmbeddings(content);

        await db.insert(embeddingsTable).values(
            embeddings.map(embedding => ({
                resourceId: resource.id,
                ...embedding // 'embedding' has 'content' and 'embedding', ... unpacks it
            })),
        );
        console.log('Resource successfully created and embedded.')
    } catch (e) {
        if (e instanceof Error)
            console.log(e.message.length > 0 ? e.message : 'Error, please try again.')
    }
}
