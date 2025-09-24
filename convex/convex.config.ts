
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

export default defineApp({
    ...betterAuth,
});
