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
  executiveSummary: string;
  companyDescription: {
    description: string;
    mission: string;
    vision: string;
    coreValues: string[];
  };
  productsAndServices: {
    description: string;
    keyFeatures: string[];
    uniqueValueProposition: string;
  };
  marketAnalysis: {
    industryOverview: string;
    targetMarket: string;
    competitiveLandscape: string;
  };
  marketingAndSalesStrategy: {
    digitalMarketingStrategy: string[];
    salesFunnel: string[];
  };
  organizationAndManagement: {
    teamStructure: string;
    keyRoles: Array<{ role: string; responsibilities: string; }>;
  };
  financialProjections: {
    summary: string;
    forecast: Array<{ year: number; revenue: string; cogs: string; netProfit: string; }>;
  };
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

export interface GrowthMetricsData {
  title: string;
  introduction: string;
  metrics: Array<{
    category: string;
    icon: any; // Can be improved with a specific icon type if you have one
    color: string;
    description: string;
    points: Array<{
      name: string;
      detail: string;
    }>;
  }>;
}

export interface StartupData {
  name: string;
  scorecard: ScorecardData;
  businessPlan: BusinessPlanData;
  websitePrototype: WebsitePrototypeData;
  pitchDeck: PitchDeckData;
  marketResearch: MarketResearchData;
  databaseSchema?: string;
  growthMetrics?: GrowthMetricsData;
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
  | 'pricingStrategy'
  | 'marketingCopy'
  | 'preLaunchWaitlist'
  // Phase 8
  | 'productHuntKit'
  | 'pressRelease'
  // Phase 9
  | 'growthMetrics'
  | 'abTestIdeas'
  | 'seoStrategy'
  // Phase 10
  | 'processAutomation'
  | 'draftJobDescriptions'
  // Phase 11
  | 'investorMatching'
  | 'dueDiligenceChecklist'
  | 'aiPitchCoach'
  | 'smithBuild';

// --- Types from Suvo-shov ---

export type MessageRole = 'user' | 'ai';

export interface FileChange {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  path: string;
  description: string;
  content?: string; // Raw file content as a string
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  projectId?: string;
  userId?: string;
  codeChanges?: FileChange[];
  version?: number;
  error?: string;
  isStreaming?: boolean;
  imageUrl?: string;
  previousFileSystem?: FileSystem;
}

export interface FileData {
  content: string; // For text files: raw text. For binary files: base64 data.
  type: string; // e.g., 'tsx', 'html', 'css', or a mime-type like 'image/png'
  isBinary?: boolean;
}

export interface FileSystem {
  [path: string]: FileData;
}

export type AiStatus = 'idle' | 'thinking' | 'streaming';

export type AppTheme = 'light' | 'dark' | 'system';

export interface LinkedRepo {
    owner: string;
    repo: string;
    branch: string;
}

export interface SyncStatus {
    status: 'idle' | 'syncing' | 'success' | 'error';
    message: string;
}