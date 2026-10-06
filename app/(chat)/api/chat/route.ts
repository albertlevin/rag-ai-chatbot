import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { z } from 'zod';
import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import {
    convertToModelMessages,
    createUIMessageStream,
    JsonToSseTransformStream,
    smoothStream,
    stepCountIs,
    streamText,
    tool,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import {
    createStreamId,
    deleteChatById,
    getChatById,
    getMessagesByChatId,
    saveChat,
    saveMessages,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema/message";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { convertToUIMessages } from '@/lib/db/utils';
import { type PostRequestBody, PostRequestBodySchema } from "./schema";

dotenv.config();

// POST /api/chat: persists the user message, streams the LLM answer, persists the answer.
export async function POST(req: Request) {

    // the request is sent from chat.tsx and validated against schema.ts
    let requestBody: PostRequestBody;
    try {
        const json = await req.json();
        requestBody = PostRequestBodySchema.parse(json);
    } catch (_) {
        return new Response("bad_request:api", { status: 400 });
    }
    try {
        const {
            id,
            message,
            selectedVisibilityType,
        }: {
            id: string;
            message: ChatMessage;
            selectedVisibilityType: VisibilityType;
        } = requestBody;

        const session = await auth();

        if (!session?.user) {
            return new Response("unauthorized:chat", { status: 401 });
        }

        const chat = await getChatById({ id });
        let messagesFromDb: DBMessage[] = [];

        if (chat) {
            if (chat.userId !== session.user.id) {
                return new Response("forbidden:chat", { status: 403 });
            }
            // only fetch messages if chat already exists
            messagesFromDb = await getMessagesByChatId({ id });
        } else {
            // the first user message (truncated) becomes the chat title
            const firstText = message.parts.find((part) => part.type === "text");
            const title = firstText && "text" in firstText
                ? firstText.text.slice(0, 60)
                : "New chat";
            await saveChat({
                id,
                userId: session.user.id,
                title,
                visibility: selectedVisibilityType,
            })
        }

        const uiMessages = [...convertToUIMessages(messagesFromDb), message]

        await saveMessages({
            messages: [
                {
                    chatId: id,
                    id: message.id,
                    role: "user",
                    parts: message.parts,
                    attachments: [],
                    createdAt: new Date(),
                },
            ],
        });

        const streamId = generateUUID();
        await createStreamId({ streamId, chatId: id });

        const stream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
                const result = streamText({
                    model: openai('gpt-5.1'),
                    system: `You are a helpful assistant. Check your knowledge base before answering any questions.`,
                    messages: convertToModelMessages(uiMessages), // expects ModelMessage[] array;
                    stopWhen: stepCountIs(5), // allows the model to use up to 5 'steps' for any given generation.
                    tools: {
                        // write to the knowledge base
                        addResource: tool({
                            description: `add a resource to your knowledge base.
                            If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
                            inputSchema: z.object({
                                content: z.string().describe('the content or resource to add to the knowledge base'),
                            }),
                            execute: async ({ content }) => createResource({ content }),
                        }),
                        // read from the knowledge base (vector similarity search)
                        addInformation: tool({
                            description: `get information from your knowledge base to answer user questions.`,
                            inputSchema: z.object({
                                question: z.string().describe('the users question'),
                            }),
                            execute: async ({ question }) => findRelevantContent(question),
                        }),
                    },
                    experimental_transform: smoothStream({ chunking: "word" }),
                })

                result.consumeStream();
                dataStream.merge(
                    result.toUIMessageStream({
                        sendReasoning: true,
                    })
                );
            },
            generateId: generateUUID,
            onFinish: async ({ messages }) => {
                await saveMessages({
                    messages: messages.map((currentMessage) => ({
                        id: currentMessage.id,
                        role: currentMessage.role,
                        parts: currentMessage.parts,
                        createdAt: new Date(),
                        attachments: [],
                        chatId: id
                    })),
                });
            },
            onError: () => {
                return "Oops, an error occurred!";
            }
        });

        return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    } catch (error) {
        console.error("Error in route.ts: ", error)
        return new Response("internal_error:chat", { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return new Response("bad_request:api", { status: 400 });
    }

    const session = await auth();

    if (!session?.user) {
        return new Response("unauthorized:chat", { status: 401 });
    }

    const chat = await getChatById({ id });

    if (chat?.userId !== session.user.id) {
        return new Response("forbidden:chat", { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
}