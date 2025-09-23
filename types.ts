
export interface Score {
  score: number;
  justification: string;
}

export interface ScorecardData {
  marketSize: Score;
  feasibility: Score;
  innovation: Score;
  overallScore: number;
}

export interface BusinessPlanData {
  slogan: string;
  problem: string;
  solution: string;
  targetAudience: string;
  revenueModel: string;
}

export interface WebsitePrototypeData {
  headline: string;
  subheading: string;
  features: { title: string; description: string }[];
  cta: string;
}

export interface PitchDeckData {
  script: string;
}

export interface MarketResearchData {
  summary: string;
  competitors: string[];
  trends: string[];
}

export interface StartupData {
  scorecard: ScorecardData;
  businessPlan: BusinessPlanData;
  websitePrototype: WebsitePrototypeData;
  pitchDeck: PitchDeckData;
  marketResearch: MarketResearchData;
}
