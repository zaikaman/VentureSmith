import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { betterAuth } from "better-auth";
import { DataModel } from "./_generated/dataModel";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import VerifyEmail from "./emails/VerifyEmail";

const siteUrl = process.env.SITE_URL!;
const resend = new Resend(process.env.RESEND_API_KEY!)

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
      emailOTP({
        sendVerificationOnSignUp: true,
        overrideDefaultEmailVerification: true,
        async sendVerificationOTP({ email, otp, type }) {
            if (type === "email-verification") {
                await resend.emails.send({
                    from: 'info@kienvocal.com',
                    to: email,
                    subject: "Verify your email address",
                    react: VerifyEmail({ otp }),
                });
            }
        },
      })
    ],
  });
};
