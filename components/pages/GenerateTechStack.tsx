import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './GenerateTechStack.css';

// --- Interfaces ---
interface Technology {
  name: string;
  justification: string;
  icon: string;
}

interface TechCategory {
  category: string;
  technologies: Technology[];
}

interface TechStackResult {
  stack: TechCategory[];
}

interface GenerateTechStackProps {
  startup: {
    _id: Id<"startups">;
    techStack?: string;
    // Add other startup fields if needed for prerequisites
    brainstormResult?: string;
  };
}

const techIconMap: { [key: string]: string } = {
  react: 'fa-brands fa-react',
  'next.js': 'fa-solid fa-bolt',
  vue: 'fa-brands fa-vuejs',
  angular: 'fa-brands fa-angular',
  svelte: 'fa-solid fa-fire',
  'node.js': 'fa-brands fa-node-js',
  python: 'fa-brands fa-python',
  go: 'fa-brands fa-golang',
  rust: 'fa-brands fa-rust',
  postgresql: 'fa-solid fa-database',
  mongodb: 'fa-solid fa-leaf',
  mysql: 'fa-solid fa-database',
  redis: 'fa-solid fa-warehouse',
  graphql: 'fa-solid fa-circle-nodes',
  aws: 'fa-brands fa-aws',
  'google cloud': 'fa-brands fa-google',
  vercel: 'fa-solid fa-play',
  netlify: 'fa-solid fa-cloud',
  docker: 'fa-brands fa-docker',
};

const techColorMap: { [key: string]: string } = {
  react: '#61DAFB',
  'next.js': '#FFFFFF',
  vue: '#4FC08D',
  angular: '#DD0031',
  svelte: '#FF3E00',
  'node.js': '#68A063',
  python: '#3776AB',
  go: '#00ADD8',
  rust: '#DEA584',
  postgresql: '#336791',
  mongodb: '#47A248',
  mysql: '#4479A1',
  redis: '#DC382D',
  graphql: '#E10098',
  aws: '#FF9900',
  'google cloud': '#4285F4',
  vercel: '#FFFFFF',
  netlify: '#00C7B7',
  docker: '#2496ED',
};

const getIconForTech = (techName: string): string => {
  const lowerCaseName = techName.toLowerCase();
  for (const key in techIconMap) {
    if (lowerCaseName.includes(key)) {
      return techIconMap[key];
    }
  }
  return 'fa-solid fa-microchip'; // Default icon
};

const getColorForTech = (techName: string): string => {
  const lowerCaseName = techName.toLowerCase();
  for (const key in techColorMap) {
    if (lowerCaseName.includes(key)) {
      return techColorMap[key];
    }
  }
  return '#FFFFFF'; // Default color
};

// --- Main Component ---
const GenerateTechStack: React.FC<GenerateTechStackProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TechStackResult | null>(null);
  const generateTechStackAction = useAction(api.actions.generateTechStack);

  const loadingTexts = [
    "Analyzing requirements...",
    "Cross-referencing frameworks...",
    "Designing database architecture...",
    "Planning deployment strategy...",
    "Finalizing recommendations..."
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGenerating]);

  useEffect(() => {
    if (startup.techStack) {
      try {
        setResult(JSON.parse(startup.techStack));
      } catch (e) {
        console.error("Failed to parse tech stack data:", e);
        toast.error("Failed to load existing tech stack.");
      }
    }
  }, [startup.techStack]);

  const handleGenerate = async () => {
    if (!startup.brainstormResult) {
        toast.error("Please complete the brainstorming step first.");
        return;
    }
    setIsGenerating(true);
    setResult(null); // Clear previous results
    try {
      // Add a minimum animation time for a better user experience
      const [actionResult, _] = await Promise.all([
        generateTechStackAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
      setResult(actionResult);
      toast.success("Technology Stack generated!");
    } catch (err: any) {
      toast.error("Failed to generate tech stack", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
        <div className="tech-animation-grid">
            <i className="fa-brands fa-react tech-icon icon-1"></i>
            <i className="fa-brands fa-node-js tech-icon icon-2"></i>
            <i className="fa-solid fa-database tech-icon icon-3"></i>
            <i className="fa-brands fa-aws tech-icon icon-4"></i>
            <i className="fa-brands fa-figma tech-icon icon-5"></i>
        </div>
        <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = (data: TechStackResult) => (
    <div className="tech-stack-results">
      {data.stack.map((category, index) => (
        <div key={index} className="tech-category-card">
          <h3 className="tech-category-header">{category.category}</h3>
          <div>
            {category.technologies.map((tech, techIndex) => (
              <div key={techIndex} className="tech-item">
                <div className="tech-item-icon">
                  <i className={getIconForTech(tech.name)} style={{ color: getColorForTech(tech.name) }}></i>
                </div>
                <div className="tech-item-details">
                  <h4>{tech.name}</h4>
                  <p>{tech.justification}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInitial = () => (
    <div className="initial-view text-center p-12 bg-slate-900 rounded-lg">
        <h3 className="text-3xl font-bold mb-4 text-white">Generate Technology Stack</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Let our AI CTO analyze your venture's context to recommend a modern, scalable, and appropriate technology stack for your MVP.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={isGenerating || !startup.brainstormResult}
        >
            {isGenerating ? 'Generating...' : 'Generate Tech Stack'}
        </button>
        {!startup.brainstormResult && <p className="text-sm text-slate-500 mt-4">Please complete the 'Brainstorm & Refine Idea' step first.</p>}
    </div>
  );

  return (
    <div className="tech-stack-container">
        <div className="header-section">
            <h2 className="text-3xl font-bold">Technology Stack Recommendation</h2>
            {result && !isGenerating && (
                 <button onClick={handleGenerate} className="regenerate-button" title="Regenerate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    <span>Regenerate</span>
                </button>
            )}
        </div>

        {isGenerating ? renderLoading() : result ? renderResults(result) : renderInitial()}
    </div>
  );
};

export default GenerateTechStack;