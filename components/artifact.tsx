// Minimal artifact definitions; artifact rendering is not implemented.
export const artifactDefinitions = [
    "textArtifact",
    "codeArtifact",
    "imageArtifact",
    "sheetArtifact",
];
export type ArtifactKind = (typeof artifactDefinitions)[number];

export type UIArtifact = {
    title: string;
    documentId: string;
    kind: ArtifactKind;
    content: string;
    isVisible: boolean;
    status: "streaming" | "idle";
    boundingBox: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
};