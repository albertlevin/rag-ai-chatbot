import { generateId, UIMessagePart } from "ai";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { DBMessage } from "./schema/message";
import { ChatMessage, CustomUIDataTypes, ChatTools } from "../types";
import { formatISO } from "date-fns";

export function generateHashedPassword(password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    return hash;
}

export function generateDummyPassword() {
    const password = generateId();
    const hashedPassword = generateHashedPassword(password);

    return hashedPassword;
}

// converts a list of DBMessages to a list of ChatMessages.
export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
    return messages.map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
        metadata: {
            createdAt: formatISO(message.createdAt),
        },
    }));
}