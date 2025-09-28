import React, { useState, useEffect, useMemo } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './DraftPressRelease.css';

interface DraftPressReleaseProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    pressRelease?: string;
    businessPlan?: string;
    brandIdentity?: string;
  };
}

interface PressReleaseData {
  headline: string;
  dateline: string;
  introduction: string;
  body: string;
  quote: string;
  aboutUs: string;
  contactEmail: string;
}

import jsPDF from 'jspdf';

const DraftPressRelease: React.FC<DraftPressReleaseProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const generatePressReleaseAction = useAction(api.actions.generatePressRelease);

  const pressReleaseData: PressReleaseData | null = useMemo(() => {
    if (!startup.pressRelease) return null;
    try {
      const parsedString = JSON.parse(startup.pressRelease);
      return JSON.parse(parsedString);
    } catch (e) {
      try {
        return JSON.parse(startup.pressRelease);
      } catch (e2) {
        console.error("Failed to parse Press Release data:", e2);
        toast.error("Failed to load existing press release.");
        return null;
      }
    }
  }, [startup.pressRelease]);

  const loadingTexts = [
    "Consulting with PR experts...",
    "Crafting a killer headline...",
    "Writing the perfect founder quote...",
    "Formatting for distribution...",
    "Finalizing the announcement...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.businessPlan && !!startup.brandIdentity;

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
      toast.error("Please complete 'Business Plan' and 'Brand Identity' steps first.");
      return;
    }
    setIsGenerating(true);
    try {
      await generatePressReleaseAction({ startupId: startup._id });
      toast.success("Press Release drafted successfully!");
    } catch (err: any) {
      console.error("Generation failed:", err);
      toast.error("Failed to draft Press Release", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pressReleaseData) return;

    const doc = new jsPDF();
    const page_width = doc.internal.pageSize.getWidth();
    const margin = 15;
    let current_y = 25;

    const checkPageBreak = (margin = 40) => {
        if (current_y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            current_y = 20;
        }
    };

    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.text(pressReleaseData.headline, page_width / 2, current_y, { align: 'center', maxWidth: page_width - margin * 2 });
    current_y += 15;

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('FOR IMMEDIATE RELEASE', page_width / 2, current_y, { align: 'center' });
    current_y += 10;

    doc.setFont('times', 'normal');
    doc.text(pressReleaseData.dateline, margin, current_y);
    current_y += 10;

    doc.setFont('times', 'italic');
    const introText = doc.splitTextToSize(pressReleaseData.introduction, page_width - margin * 2);
    doc.text(introText, margin, current_y);
    current_y += (introText.length * 7) + 10;

    doc.setFont('times', 'normal');
    const bodyText = doc.splitTextToSize(pressReleaseData.body, page_width - margin * 2);
    doc.text(bodyText, margin, current_y);
    current_y += (bodyText.length * 7) + 10;

    doc.setFont('times', 'italic');
    const quoteText = doc.splitTextToSize(`"${pressReleaseData.quote}"`, page_width - margin * 2 - 20);
    doc.text(quoteText, margin + 10, current_y);
    current_y += (quoteText.length * 7) + 5;

    doc.setFont('times', 'bold');
    doc.text(`- ${startup.name} Founder & CEO`, margin + 15, current_y);
    current_y += 15;

    doc.setFont('times', 'bold');
    doc.text(`About ${startup.name || 'the Company'}`, margin, current_y);
    current_y += 8;

    doc.setFont('times', 'normal');
    const aboutText = doc.splitTextToSize(pressReleaseData.aboutUs, page_width - margin * 2);
    doc.text(aboutText, margin, current_y);
    current_y += (aboutText.length * 7) + 10;

    doc.setFont('times', 'bold');
    doc.text('Media Contact:', page_width / 2, current_y, { align: 'center' });
    current_y += 7;
    doc.setFont('times', 'normal');
    doc.text(pressReleaseData.contactEmail, page_width / 2, current_y, { align: 'center' });
    current_y += 10;

    doc.setFont('times', 'bold');
    doc.text('###', page_width / 2, current_y, { align: 'center' });

    doc.save(`${startup.name || 'Press-Release'}.pdf`);
  };

  const renderLoading = () => (
    <div className="loading-container">
      <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet" />
      <div className="typewriter-animation-container">
        <div className="typewriter-paper">
            <div className="typewriter-text">{pressReleaseData?.headline || 'New Startup Launch...'}</div>
        </div>
        <div className="typewriter-body">
            <div className="typewriter-key key-1"></div>
            <div className="typewriter-key key-2"></div>
            <div className="typewriter-key key-3"></div>
        </div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = (data: PressReleaseData) => (
    <div className="pr-results-container">
        <h1 className="pr-headline">{data.headline}</h1>
        <p className="pr-dateline"><strong>FOR IMMEDIATE RELEASE</strong><br/>{data.dateline}</p>
        <p className="pr-introduction">{data.introduction}</p>
        <div className="pr-body">{data.body}</div>
        <div className="pr-quote-section">
            <p>"{data.quote}"</p>
            <p><strong>- {startup.name} Founder & CEO</strong></p>
        </div>
        <div className="pr-about-section">
            <h3>About {startup.name || 'the Company'}</h3>
            <p>{data.aboutUs}</p>
        </div>
        <div className="pr-contact-section">
            <p><strong>Media Contact:</strong><br/>{data.contactEmail}</p>
        </div>
        <div className="pr-end-mark">###</div>
    </div>
  );

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Draft a Professional Press Release</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Generate a complete, well-structured press release to announce your startup to the world.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            <i className="fas fa-newspaper" style={{marginRight: '8px'}}></i>
            Draft Press Release
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete the 'Business Plan' and 'Brand Identity' steps first.</p>}
    </div>
  );

  const hasContent = !!pressReleaseData || isGenerating;

  return (
    <div className="press-release-container">
      {hasContent && (
        <TaskResultHeader title="Press Release" onRegenerate={handleGenerate}>
            {pressReleaseData && !isGenerating && (
                <button onClick={handleDownloadPDF} className="regenerate-button" title="Export to PDF">
                    <i className="fas fa-file-pdf"></i>
                    <span>Export to PDF</span>
                </button>
            )}
        </TaskResultHeader>
      )}

      {isGenerating ? renderLoading() : pressReleaseData ? renderResults(pressReleaseData) : (
        <InitialTaskView
            title="Draft a Professional Press Release"
            description="Generate a complete, well-structured press release to announce your startup to the world."
            buttonText="Draft Press Release"
            onAction={handleGenerate}
            disabled={!canGenerate}
            buttonIcon={<i className="fas fa-newspaper"></i>}
        />
      )}
    </div>
  );
};

export default DraftPressRelease;