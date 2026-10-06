import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod"
import "dotenv/config"

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        DATABASE_URL: z.string().min(1),
        AUTH_SECRET: z.string()
    },
    // client: {
    //     experimental_runtimeEnv: {
    //         NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,

    //     }
    // }

})