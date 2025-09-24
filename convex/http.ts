
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "../lib/auth";

const http = httpRouter();

http.any({
    path: "/api/auth/*",
    handler: httpAction(auth.handler),
});

export default http;
