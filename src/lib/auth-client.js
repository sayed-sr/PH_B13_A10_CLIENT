import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return "http://localhost:3000";
};

export const { signIn, signUp, signOut, useSession } = createAuthClient({
    baseURL: getBaseUrl(),
});