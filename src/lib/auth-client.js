import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
    // Hardcoding to port 3000 ensures it never tries to hit the Express backend on 5000
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});