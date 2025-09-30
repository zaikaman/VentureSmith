import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import './DraftJobDescriptions.css';

interface JobDescription {
  title: string;
  department: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
}

interface DraftJobDescriptionsProps {
  startup: {
    _id: Id<"startups">;
    draftJobDescriptions?: string; // JSON string of JobDescription[]
    businessPlan?: string;
    developmentRoadmap?: string;
  };
}

const AccordionItem: React.FC<{ job: JobDescription, isOpen: boolean, onClick: () => void }> = ({ job, isOpen, onClick }) => (
    <div className="job-accordion-item">
        <div className="job-accordion-header" onClick={onClick}>
            <h3>{job.title}</h3>
            <span className="department-badge">{job.department}</span>
        </div>
        {isOpen && (
            <div className="job-accordion-content">
                <p>{job.summary}</p>
                <h4>Responsibilities</h4>
                <ul>
                    {job.responsibilities && job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
                <h4>Qualifications</h4>
                <ul>
                    {job.qualifications && job.qualifications.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        )}
    </div>
);

const DraftJobDescriptions: React.FC<DraftJobDescriptionsProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const generateAction = useAction(api.actions.generateJobDescriptions);

  const loadingTexts = [
    "Analyzing organizational needs from business plan...",
    "Identifying key roles from development roadmap...",
    "Defining core responsibilities and qualifications...",
    "Crafting compelling job descriptions...",
    "Building your foundational team structure...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.businessPlan && !!startup.developmentRoadmap;

  useEffect(() => {
    if (startup.draftJobDescriptions) {
      try {
        const parsedData = JSON.parse(startup.draftJobDescriptions);
        let jobsList: JobDescription[] = [];

        if (parsedData.jobs && Array.isArray(parsedData.jobs)) {
          jobsList = parsedData.jobs; // Handles new format { jobs: [...] }
        } else if (parsedData.roles && Array.isArray(parsedData.roles)) {
          jobsList = parsedData.roles; // Handles old format { roles: [...] }
        } else if (parsedData.job_descriptions && Array.isArray(parsedData.job_descriptions)) {
          jobsList = parsedData.job_descriptions; // Handles old format { job_descriptions: [...] }
        } else if (Array.isArray(parsedData)) {
          jobsList = parsedData; // Handles old format [...]
        } else if (typeof parsedData === 'object' && parsedData !== null && parsedData.title) {
          jobsList = [parsedData]; // Handles old format {...} as a single item array
        }
        
        setJobs(jobsList);
        if (jobsList.length > 0) {
            setOpenAccordion(jobsList[0].title);
        }
      } catch (e) {
        console.error("Failed to parse job descriptions:", e);
        toast.error("Failed to load existing job descriptions.");
      }
    }
  }, [startup.draftJobDescriptions]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, loadingTexts]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete 'Business Plan' and 'Development Roadmap' first.");
      return;
    }
    setIsGenerating(true);
    setJobs([]);
    try {
      const [generatedResult, _] = await Promise.all([
        generateAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
      
      if (generatedResult && generatedResult.jobs && Array.isArray(generatedResult.jobs)) {
        const jobsData = generatedResult.jobs;
        setJobs(jobsData);
        if (jobsData.length > 0) {
            setOpenAccordion(jobsData[0].title);
        }
        toast.success("Job Descriptions drafted successfully!");
      } else {
        console.error("Invalid format received from AI:", generatedResult);
        throw new Error("Received an invalid or empty response from the AI. Please try again.");
      }
    } catch (err: any) {
      console.error("Job description generation failed:", err);
      toast.error("Failed to draft Job Descriptions", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccordionClick = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="hiring-animation-container">
        <div className="org-chart-node"><i className="fas fa-users"></i></div>
        
        

        <div className="candidate-card-container pos-1">
            <div className="candidate-card">
                <div className="card-face card-front"><i className="fas fa-user"></i></div>
                <div className="card-face card-back"><i className="fas fa-check"></i></div>
            </div>
        </div>
        <div className="candidate-card-container pos-2">
            <div className="candidate-card" style={{ animationDelay: '1.2s'}}>
                <div className="card-face card-front"><i className="fas fa-user"></i></div>
                <div className="card-face card-back"><i className="fas fa-check"></i></div>
            </div>
        </div>
        <div className="candidate-card-container pos-3">
            <div className="candidate-card" style={{ animationDelay: '1.4s'}}>
                <div className="card-face card-front"><i className="fas fa-user"></i></div>
                <div className="card-face card-back"><i className="fas fa-check"></i></div>
            </div>
        </div>
      </div>
      <div className="mobile-spinner"></div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="job-results-container">
        {jobs.map((job, index) => (
            <AccordionItem 
                key={index} 
                job={job} 
                isOpen={openAccordion === job.title}
                onClick={() => handleAccordionClick(job.title)}
            />
        ))}
    </div>
  );

  const hasContent = jobs.length > 0 || isGenerating;

  return (
    <div className="job-descriptions-container">
      {hasContent && (
        <TaskResultHeader title="Draft Job Descriptions" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : jobs.length > 0 ? renderResults() : (
        <InitialTaskView
          title="Draft Key Job Descriptions"
          description="Automatically generate professional job descriptions for the key roles needed to build and grow your venture."
          buttonText="Draft Descriptions"
          onAction={handleGenerate}
          disabled={!canGenerate}
          disabledReason={!canGenerate ? "Complete 'Business Plan' and 'Dev Roadmap' first." : undefined}
        />
      )}
    </div>
  );
};

export default DraftJobDescriptions;
