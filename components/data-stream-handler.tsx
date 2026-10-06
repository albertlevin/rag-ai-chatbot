"use client";

import { useEffect, useRef } from "react";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";
import { artifactDefinitions } from "./artifact";
import { useDataStream } from "./data-stream-provider";

export function DataStreamHander() {
    const { dataStream, setDataStream } = useDataStream();
    const { artifact, setArtifact, setMetadata } = useArtifact();

    useEffect(() => {
        // if the data stream is empty
        if (!dataStream?.length) {
            return;
        }

        // copy the stream, reset it
        const newDeltas = dataStream.slice();
        setDataStream([]);

        for (const delta of newDeltas) {
            setArtifact((draftArtifact) => {
                if (!draftArtifact) {
                    return { ...initialArtifactData, status: "streaming" };
                }

                switch (delta.type) {
                    case "data-id":
                        return {
                            ...draftArtifact,
                            documentId: delta.data,
                            status: "streaming",
                        };

                    case "data-title":
                        return {
                            ...draftArtifact,
                            title: delta.data,
                            status: "streaming",
                        };

                    case "data-kind":
                        return {
                            ...draftArtifact,
                            kind: delta.data,
                            status: "streaming",
                        };

                    case "data-clear":
                        return {
                            ...draftArtifact,
                            content: "",
                            status: "streaming",
                        };

                    case "data-finish":
                        return {
                            ...draftArtifact,
                            status: "idle",
                        };

                    default:
                        return draftArtifact;
                }
            });
        }
    }, [dataStream, setArtifact, setMetadata, artifact]);

    return null;
}