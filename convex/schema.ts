
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    subject: v.string(),
  }).index("by_subject", ["subject"]),

  startups: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    idea: v.optional(v.string()),
    brainstormResult: v.optional(v.string()),
    dashboard: v.optional(v.string()),
    businessPlan: v.optional(v.string()),
    website: v.optional(v.string()),
    pitchDeck: v.optional(v.string()),
    marketResearch: v.optional(v.string()),
    marketPulse: v.optional(v.string()),
    missionVision: v.optional(v.string()),
    brandIdentity: v.optional(v.string()),
    competitorMatrix: v.optional(v.string()),
    customerPersonas: v.optional(v.string()),
    interviewScripts: v.optional(v.string()),
    customerValidation: v.optional(v.string()),
    userFlowDiagram: v.optional(v.string()),
    aiWireframe: v.optional(v.string()),
    aiMentor: v.optional(v.string()),
    techStack: v.optional(v.string()),
    databaseSchema: v.optional(v.string()),
    apiEndpoints: v.optional(v.string()),
    developmentRoadmap: v.optional(v.string()),
    costEstimate: v.optional(v.string()),
    pricingStrategy: v.optional(v.string()),
    marketingCopy: v.optional(v.string()),
    preLaunchWaitlist: v.optional(v.string()),
    productHuntKit: v.optional(v.string()),
    pressRelease: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
