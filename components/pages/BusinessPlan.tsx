import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { BusinessPlanData } from '../../types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    // If it's an object, stringify it to see the content instead of [object Object]
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

  // Effect to parse existing data
  useEffect(() => {
    if (startup.businessPlan) {
      setResult(JSON.parse(startup.businessPlan));
    }
  }, [startup.businessPlan]);

  // Effect for Intersection Observer
  useEffect(() => {
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
  }, [result]); // Re-run when result is populated

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
      }, 5000); // Animation duration
    } catch (err: any) {
      toast.error("Failed to build business plan. Please try again.");
      setIsBuilding(false);
    }
  };

  const handleDownloadPDF = () => { /* PDF logic can be reused */ };

  const sections = [
    { id: 'executiveSummary', title: 'Executive Summary' },
    { id: 'companyDescription', title: 'Company Description' },
    { id: 'productsAndServices', title: 'Products & Services' },
    { id: 'marketAnalysis', title: 'Market Analysis' },
    { id: 'marketingAndSalesStrategy', title: 'Marketing Strategy' },
    { id: 'organizationAndManagement', title: 'Management' },
    { id: 'financialProjections', title: 'Financials' },
  ];

  if (isBuilding) {
    return (
        <div className="architect-container">
            <div className="construction-site">
                <div className="foundation"></div>
                <div className="building-block block-1"></div>
                <div className="building-block block-2"></div>
                <div className="building-block block-3"></div>
                <div className="building-block block-4"></div>
                <div className="drone"></div>
            </div>
            <div className="build-status-text">ARCHITECT AI IS BUILDING YOUR FUTURE...</div>
        </div>
    );
  }

  if (result) {
    return (
        <div className="bp-document-container">
            <div className="bp-header">
                <h2 className="text-3xl font-bold">Business Plan: {startup.name}</h2>
                <div className="bp-header-actions">
                    <button onClick={handleBuild} className="regenerate-button" title="Regenerate">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                    <button onClick={handleDownloadPDF} className="download-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>
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
                                        }}
                                    >
                                        {sec.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main className="bp-doc-content">
                    <Section id="executiveSummary" title="Executive Summary" setRef={setSectionRef('executiveSummary')}><p>{cleanText(result.executiveSummary)}</p></Section>
                    
                    <Section id="companyDescription" title="Company Description" setRef={setSectionRef('companyDescription')}>
                        <p>{cleanText(result.companyDescription?.description)}</p>
                        <h5 className="bp-sub-heading">Core Values</h5>
                        <div className="bp-tags-container">
                            {result.companyDescription?.coreValues?.map(value => <span key={value} className="bp-tag">{value}</span>)}
                        </div>
                    </Section>

                    <Section id="productsAndServices" title="Products & Services" setRef={setSectionRef('productsAndServices')}>
                        <p>{cleanText(result.productsAndServices?.description)}</p>
                        <h5 className="bp-sub-heading">Key Features</h5>
                        <ul className="bp-list">{result.productsAndServices?.keyFeatures?.map(item => <li key={item}>{item}</li>)}</ul>
                        <h5 className="bp-sub-heading">Unique Value Proposition</h5>
                        <p>{cleanText(result.productsAndServices?.uniqueValueProposition)}</p>
                    </Section>

                    <Section id="marketAnalysis" title="Market Analysis" setRef={setSectionRef('marketAnalysis')}>
                        <h5 className="bp-sub-heading">Industry Overview</h5>
                        <p>{cleanText(result.marketAnalysis?.industryOverview)}</p>
                        <h5 className="bp-sub-heading">Target Market</h5>
                        <p>{cleanText(result.marketAnalysis?.targetMarket)}</p>
                        <h5 className="bp-sub-heading">Competitive Landscape</h5>
                        <p>{cleanText(result.marketAnalysis?.competitiveLandscape)}</p>
                    </Section>

                    <Section id="marketingAndSalesStrategy" title="Marketing & Sales Strategy" setRef={setSectionRef('marketingAndSalesStrategy')}>
                        <h5 className="bp-sub-heading">Digital Marketing</h5>
                        <ul className="bp-list">{result.marketingAndSalesStrategy?.digitalMarketingStrategy?.map(item => <li key={item}>{item}</li>)}</ul>
                        <h5 className="bp-sub-heading">Sales Funnel</h5>
                        <ul className="bp-list">{result.marketingAndSalesStrategy?.salesFunnel?.map(item => <li key={item}>{item}</li>)}</ul>
                    </Section>

                    <Section id="organizationAndManagement" title="Organization & Management" setRef={setSectionRef('organizationAndManagement')}>
                        <p>{cleanText(result.organizationAndManagement?.teamStructure)}</p>
                        <h5 className="bp-sub-heading">Key Roles</h5>
                        <ul className="bp-list">{result.organizationAndManagement?.keyRoles?.map(item => <li key={item.role}><strong>{item.role}:</strong> {item.responsibilities}</li>)}</ul>
                    </Section>

                    <Section id="financialProjections" title="Financial Projections" setRef={setSectionRef('financialProjections')}>
                        <p>{cleanText(result.financialProjections?.summary)}</p>
                        <div className="financial-table-container">
                            <table className="financial-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Revenue</th>
                                        <th>COGS</th>
                                        <th>Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(result.financialProjections?.forecast || []).map((item: any) => (
                                        <tr key={item.year}>
                                            <td>Year {item.year}</td>
                                            <td>{item.revenue}</td>
                                            <td>{item.cogs}</td>
                                            <td>{item.netProfit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
  }

  return (
    <div className="bp-initial-view">
        <h2 className="text-3xl font-bold mb-4">Generate Your Business Plan</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Let our Futurist Architect construct a detailed 7-part business plan from your venture's DNA.
        </p>
        <button onClick={handleBuild} disabled={!canBuild} className="cta-button">
            Construct Blueprint
        </button>
        {!canBuild && <p className="text-sm text-slate-500 mt-4">Please complete all previous steps first.</p>}
    </div>
  );
};