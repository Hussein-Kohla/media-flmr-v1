import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    // In a real app, this should be your backend URL.
    // For now, we point to the current origin.
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    plugins: [
        phoneNumberClient()
    ]
});
