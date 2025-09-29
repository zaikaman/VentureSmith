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

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const page_width = doc.internal.pageSize.getWidth();
    const margin = 14;
    let current_y = 40;

    const checkPageBreak = (margin = 40) => {
        if (current_y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            current_y = 20;
        }
    };

    doc.setFontSize(20);
    doc.text("Business Plan", page_width / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(startup.name || '', page_width / 2, 30, { align: "center" });

    const addSectionTitle = (title: string) => {
        checkPageBreak();
        doc.setFontSize(16);
        doc.text(title, margin, current_y);
        current_y += 10;
    };

    const addSubheading = (title: string) => {
        checkPageBreak();
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(title, margin, current_y);
        current_y += 8;
        doc.setTextColor(0);
    };

    const addParagraph = (text: string | undefined) => {
        checkPageBreak();
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(cleanText(text), page_width - margin * 2);
        doc.text(splitText, margin, current_y);
        current_y += (splitText.length * 7) + 7;
    };

    const addList = (items: string[] | undefined) => {
        checkPageBreak();
        doc.setFontSize(12);
        (items || []).forEach(item => {
            checkPageBreak(20);
            const splitItem = doc.splitTextToSize(`- ${cleanText(item)}`, page_width - margin * 2 - 5);
            doc.text(splitItem, margin + 5, current_y);
            current_y += (splitItem.length * 7) + 3;
        });
        current_y += 7;
    };

    // Building the PDF
    addSectionTitle("1. Executive Summary");
    addParagraph(result.executiveSummary);

    addSectionTitle("2. Company Description");
    addParagraph(result.companyDescription?.description);
    addSubheading("Core Values");
    addList(result.companyDescription?.coreValues);

    addSectionTitle("3. Products & Services");
    addParagraph(result.productsAndServices?.description);
    addSubheading("Key Features");
    addList(result.productsAndServices?.keyFeatures);
    addSubheading("Unique Value Proposition");
    addParagraph(result.productsAndServices?.uniqueValueProposition);

    addSectionTitle("4. Market Analysis");
    addSubheading("Industry Overview");
    addParagraph(result.marketAnalysis?.industryOverview);
    addSubheading("Target Market");
    addParagraph(result.marketAnalysis?.targetMarket);
    addSubheading("Competitive Landscape");
    addParagraph(result.marketAnalysis?.competitiveLandscape);

    addSectionTitle("5. Marketing & Sales Strategy");
    addSubheading("Digital Marketing Strategy");
    addList(result.marketingAndSalesStrategy?.digitalMarketingStrategy);
    addSubheading("Sales Funnel");
    addList(result.marketingAndSalesStrategy?.salesFunnel);

    addSectionTitle("6. Organization & Management");
    addParagraph(result.organizationAndManagement?.teamStructure);
    // You could add a table for key roles here if desired

    addSectionTitle("7. Financial Projections");
    addParagraph(result.financialProjections?.summary);
    current_y += 5;

    autoTable(doc, {
        startY: current_y,
        head: [['Year', 'Revenue', 'COGS', 'Net Profit']],
        body: result.financialProjections?.forecast.map(item => [
            `Year ${item.year}`,
            item.revenue,
            item.cogs,
            item.netProfit
        ]),
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
    });

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

  const renderInitial = () => (
    <InitialTaskView
        title="Generate Your Business Plan"
        description="Let our Futurist Architect construct a detailed 7-part business plan from your venture's DNA."
        buttonText="Construct Blueprint"
        onAction={handleBuild}
        disabled={!canBuild}
    />
  );

  const renderResults = () => (
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

  return result ? renderResults() : renderInitial();
};