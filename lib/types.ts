import type { ArtifactKind } from "@/components/artifact";
import type { Suggestion } from "./db/schema/suggestion";
import type { AppUsage } from "./usage";
import type { InferUITool, UIMessage } from "ai";
import { z } from "zod"
import type { getWeather } from './ai/tools/get-weather'
// ChatMessage is a wrapper of UIMessage, but with tools and message metadata.

export type CustomUIDataTypes = {
    textDelta: string;
    imageDelta: string;
    sheetDelta: string;
    codeDelta: string;
    suggestion: Suggestion;
    appendMessage: string;
    id: string;
    title: string;
    kind: ArtifactKind;
    clear: null;
    finish: null;
    usage: AppUsage;
};

export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>

export type ChatTools = {
    getWeather: weatherTool,
    // createDocument: "createDocumentTool";
    // updateDocument: "updateDocumentTool";
    // requestSuggestions: "requestSuggestionsTool";
}
export type ChatMessage = UIMessage<
    MessageMetadata,
    CustomUIDataTypes,
    ChatTools
>

export type Attachment = {
    name: string;
    url: string;
    contentType: string;
}