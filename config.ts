type ASTC_TARGET =
    | "4x4"
    | "5x4"
    | "5x5"
    | "6x5"
    | "6x6"
    | "8x5"
    | "8x6"
    | "10x5"
    | "10x6"
    | "8x8"
    | "10x8"
    | "10x10"
    | "12x10"
    | "12x12"
    | "3x3x3"
    | "4x3x3"
    | "4x4x3"
    | "4x4x4"
    | "5x4x4"
    | "5x5x4"
    | "5x5x5"
    | "6x5x5"
    | "6x6x5"
    | "6x6x6";

type ASTC_QUALITY = "fastest" | "fast" | "medium" | "thorough" | "exhaustive";

export default {
    FROM: "./images",
    TO: "./output",
    ASTC_BIN: "./bin/astcenc.exe",
    QUALITY: "medium",
    TARGET: "8x8",
} as {
    FROM: string;
    TO: string;
    ASTC_BIN: string;
    QUALITY: ASTC_QUALITY;
    TARGET: ASTC_TARGET;
};
