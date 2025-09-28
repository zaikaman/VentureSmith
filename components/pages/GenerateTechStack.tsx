import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
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

const getIconForCategory = (categoryName: string): string => {
  const lowerCaseName = categoryName.toLowerCase();
  if (lowerCaseName.includes('frontend')) return 'fa-solid fa-desktop';
  if (lowerCaseName.includes('backend')) return 'fa-solid fa-server';
  if (lowerCaseName.includes('database')) return 'fa-solid fa-database';
  if (lowerCaseName.includes('deployment')) return 'fa-solid fa-cloud-arrow-up';
  return 'fa-solid fa-layer-group'; // Default icon
};

// --- Main Component ---
const GenerateTechStack: React.FC<GenerateTechStackProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TechStackResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
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
        <div className="mobile-spinner"></div>
        <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = (data: TechStackResult) => (
    <div className="accordion">
      {data.stack.map((category, index) => (
        <div key={index} className="accordion-item">
          <button 
            className="accordion-header" 
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <i className={`${getIconForCategory(category.category)} category-icon`}></i>
            <h3>{category.category}</h3>
            <span className={`accordion-chevron ${activeIndex === index ? 'expanded' : ''}`}>
              <i className="fas fa-chevron-down"></i>
            </span>
          </button>
          {activeIndex === index && (
            <div className="accordion-content">
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
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="tech-stack-container">
        {isGenerating ? renderLoading() : result ?
        <>
            <TaskResultHeader title="Technology Stack Recommendation" onRegenerate={handleGenerate} />
            {renderResults(result)}
        </>
         : (
            <InitialTaskView
                title="Generate Technology Stack"
                description="Let our AI CTO analyze your venture's context to recommend a modern, scalable, and appropriate technology stack for your MVP."
                buttonText={isGenerating ? 'Generating...' : 'Generate Tech Stack'}
                onAction={handleGenerate}
                disabled={isGenerating || !startup.brainstormResult}
            />
        )}
    </div>
  );
};

export default GenerateTechStack;