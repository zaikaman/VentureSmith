import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { BusinessPlanData } from '../../types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './BusinessPlan.css';

// --- PROPS INTERFACE ---
interface BusinessPlanProps {
  startup: {
    _id: Id<"startups">;
    name?: string | undefined;
    businessPlan?: string | undefined;
    // Data from previous steps
    brainstormResult?: string | undefined;
    marketPulse?: string | undefined;
    missionVision?: string | undefined;
    brandIdentity?: string | undefined;
  };
}

// --- HELPER & SUB-COMPONENTS ---
const cleanText = (data: any): string => {
    if (!data) return 'Not available';
    if (typeof data === 'string') return data.replace(/\*/g, '');
    if (typeof data === 'object') return JSON.stringify(data, null, 2);
    return String(data);
};

const Section: React.FC<{ id: string; title: string; children: React.ReactNode; setRef: (el: HTMLElement | null) => void }> = ({ id, title, children, setRef }) => (
    <section id={id} ref={setRef} className="bp-doc-section">
        <h3 className="bp-doc-section-title">{title}</h3>
        <div className="bp-doc-section-content">{children}</div>
    </section>
);

// --- MAIN COMPONENT ---
export const BusinessPlan: React.FC<BusinessPlanProps> = ({ startup }) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [result, setResult] = useState<BusinessPlanData | null>(null);
  const [activeSection, setActiveSection] = useState<string>('executiveSummary');
  const generateBusinessPlan = useAction(api.actions.generateBusinessPlan);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const canBuild = startup.brainstormResult && startup.marketPulse && startup.missionVision && startup.brandIdentity;

  useEffect(() => {
    if (startup.businessPlan) {
      try {
        setResult(JSON.parse(startup.businessPlan));
      } catch (e) {
        console.error("Failed to parse business plan:", e)
        setResult(null);
      }
    }
  }, [startup.businessPlan]);

  useEffect(() => {
    if (!result) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px', threshold: 0 }
    );

    const refs = sectionRefs.current;
    Object.values(refs).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(refs).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [result]);

  const handleBuild = async () => {
    if (!canBuild) {
      toast.error("Previous steps must be completed first.");
      return;
    }
    setIsBuilding(true);
    setResult(null);

    try {
      const buildResult = await generateBusinessPlan({ startupId: startup._id });
      setTimeout(() => {
        setResult(buildResult);
        setIsBuilding(false);
      }, 5000);
    } catch (err: any) {
      toast.error("Failed to build business plan. Please try again.");
      setIsBuilding(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    // ... (rest of PDF generation logic is omitted for brevity)
    doc.save(`${startup.name || 'Business-Plan'}.pdf`);
  };

  const sections = [
    { id: 'executiveSummary', title: 'Executive Summary' },
    { id: 'companyDescription', title: 'Company Description' },
    { id: 'productsAndServices', title: 'Products & Services' },
    { id: 'marketAnalysis', title: 'Market Analysis' },
    { id: 'marketingAndSalesStrategy', title: 'Marketing Strategy' },
    { id: 'organizationAndManagement', title: 'Management' },
    { id: 'financialProjections', title: 'Financials' },
  ];

  return (
    <div>
        {isBuilding ? (
            <div className="architect-container">
                <div className="construction-site">
                    <div className="foundation"></div>
                    <div className="building-block block-1"></div>
                    <div className="building-block block-2"></div>
                    <div className="building-block block-3"></div>
                    <div className="building-block block-4"></div>
                    <div className="drone"></div>
                </div>
                <div className="mobile-spinner"></div>
                <div className="build-status-text">ARCHITECT AI IS BUILDING YOUR FUTURE...</div>
            </div>
        ) : result ? (
            <div className="bp-document-container">
                <TaskResultHeader title={`Business Plan: ${startup.name}`} onRegenerate={handleBuild}>
                    <button onClick={handleDownloadPDF} className="regenerate-button" title="Download PDF">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span>Download PDF</span>
                    </button>
                </TaskResultHeader>
                <div className="bp-document-layout">
                    <aside className="bp-sidebar">
                        <nav>
                            <ul>
                                {sections.map(sec => (
                                    <li key={sec.id}>
                                        <a 
                                            href={`#${sec.id}`}
                                            className={activeSection === sec.id ? 'active' : ''}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                sectionRefs.current[sec.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}>
                                            {sec.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>
                    <main className="bp-doc-content">
                        <Section id="executiveSummary" title="Executive Summary" setRef={setSectionRef('executiveSummary' )}><p>{cleanText(result.executiveSummary)}</p></Section>
                        {/* ... other sections ... */}
                    </main>
                </div>
            </div>
        ) : (
            <InitialTaskView
                title="Generate Your Business Plan"
                description="Let our Futurist Architect construct a detailed 7-part business plan from your venture's DNA."
                buttonText="Construct Blueprint"
                onAction={handleBuild}
                disabled={!canBuild}
            />
        )}
    </div>
  );
};