
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
  code: string;
}

export interface PitchDeckData {
  script: string;
  slides: Array<{
    title: string;
    content: string;
  }>;
}

export interface MarketResearchData {
  summary: string;
  competitors: string[];
  trends: string[];
}

export interface StartupData {
  name: string;
  scorecard: ScorecardData;
  businessPlan: BusinessPlanData;
  websitePrototype: WebsitePrototypeData;
  pitchDeck: PitchDeckData;
  marketResearch: MarketResearchData;
}
