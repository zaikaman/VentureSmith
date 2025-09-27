
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
  databaseSchema?: string;
}

export type TaskID =
  // Phase 1
  | 'brainstormIdea'
  | 'marketPulseCheck'
  | 'defineMissionVision'
  // Phase 2
  | 'generateNameIdentity'
  | 'scorecard'
  | 'businessPlan'
  | 'pitchDeck'
  // Phase 3
  | 'marketResearch'
  | 'competitorMatrix'
  | 'generateCustomerPersonas'
  // Phase 4
  | 'generateInterviewScripts'
  | 'validateProblem'
  | 'aiMentor'
  // Phase 5
  | 'userFlowDiagrams'
  | 'aiWireframing'
  | 'website'
  // Phase 6: Technical Blueprint & Planning
  | 'generateTechStack'
  | 'generateDatabaseSchema'
  | 'generateAPIEndpoints'
  | 'generateDevelopmentRoadmap'
  | 'estimateCosts'
  // Phase 7
  | 'alphaTesting'
  | 'betaTesterRecruitment'
  | 'feedbackAnalysis'
  // Phase 8
  | 'pricingStrategy'
  | 'marketingCopy'
  | 'preLaunchWaitlist'
  // Phase 9
  | 'productHuntKit'
  | 'pressRelease'
  | 'launchMonitoring'
  // Phase 10
  | 'growthMetrics'
  | 'abTestIdeas'
  | 'seoStrategy'
  // Phase 11
  | 'processAutomation'
  | 'draftJobDescriptions'
  // Phase 12
  | 'investorMatching'
  | 'dueDiligenceChecklist'
  | 'aiPitchCoach';
