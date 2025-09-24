import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";

export const auth = createClient({
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        convex(),
    ],
});