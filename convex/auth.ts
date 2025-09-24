import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { betterAuth } from "better-auth";
import { DataModel } from "./_generated/dataModel";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    logger: {
      disabled: optionsOnly,
    },
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex(),
    ],
  });
};
