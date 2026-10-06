import { customAlphabet } from "nanoid"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UIMessage } from "ai";
import type { ChatMessage } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const fetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
        const { code, cause } = await response.json()
        throw new Error(`Fetch error: code: ${code}, cause: ${cause}`)
    }

    return response.json();
}

export async function fetchWithErrorHandlers(
    input: RequestInfo | URL,
    init?: RequestInit,
) {
    try {
        const response = await fetch(input, init);

        if (!response.ok) {
            const { code, cause } = await response.json();
            throw new Error(`Fetch error: code: ${code}, cause: ${cause}`)
        }
        return response;
    } catch (error: unknown) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error('offline:chat');
        }

        throw error;
    }
}

// replaces 'has_function_call' with nothing in UI messages.
export function sanitizeText(text: string) {
    return text.replace('<has_function_call>', '')
}

// gets text from message
export function getTextFromMessage(message: ChatMessage | UIMessage): string {
    return message.parts.filter((part) => part.type === 'text').map((part) => (part as { type: 'text'; text: string }).text).join('');
}

