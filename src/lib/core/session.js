import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getUserSession = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        return session?.user;
    } catch (error) {
        console.error("Error fetching session:", error);
        return null;
    }
};