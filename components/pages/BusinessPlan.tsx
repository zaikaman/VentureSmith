import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { BusinessPlanData } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './BusinessPlan.css';

interface BusinessPlanProps {
  startup: {
    _id: Id<"startups">;
    idea?: string | undefined;
    name?: string | undefined;
    businessPlan?: string | undefined;
  };
}

const cleanText = (text: string) => {
    return text ? String(text).replace(/\*/g, '') : '';
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="bp-section">
        <h3 className="bp-section-title">{title}</h3>
        <div className="bp-section-content">{children}</div>
    </section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bp-subsection">
        <h4 className="bp-subsection-title">{title}</h4>
        <p>{children}</p>
    </div>
);

export const BusinessPlan: React.FC<BusinessPlanProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generateBusinessPlan = useAction(api.actions.generateBusinessPlan);

  useEffect(() => {
    if (startup.businessPlan) {
      try {
        setBusinessPlanData(JSON.parse(startup.businessPlan));
      } catch (e) {
        console.error("Failed to parse business plan data:", e);
        setError("Failed to load existing business plan data.");
      }
    }
  }, [startup.businessPlan]);

  const handleGenerate = async () => {
    if (!startup.idea) {
      setError("Initial idea is missing.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateBusinessPlan({
        startupId: startup._id,
        idea: startup.idea,
      });
      setBusinessPlanData(result);
    } catch (err: any) {
      setError("Failed to generate business plan. Please try again.");
      console.error("Error generating business plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!businessPlanData) return;
    const data = businessPlanData;
    const idea = startup.name || '';

    const doc = new jsPDF();
    const page_width = doc.internal.pageSize.getWidth();
    const page_height = doc.internal.pageSize.getHeight();
    const center_pos = page_width / 2;
    
    doc.setFontSize(20);
    doc.text("Business Plan", center_pos, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(idea, center_pos, 30, { align: "center" });

    let current_y = 40;

    const checkPageBreak = () => {
        if (current_y > page_height - 40) { // 40 is a margin
            doc.addPage();
            current_y = 20;
        }
    }

    const addSection = (title: string, content: string) => {
        checkPageBreak();
        doc.setFontSize(16);
        doc.text(title, 14, current_y);
        current_y += 8;
        doc.setFontSize(12);
        const splitContent = doc.splitTextToSize(cleanText(content), 180);
        doc.text(splitContent, 14, current_y);
        current_y += splitContent.length * 7 + 10;
    };

    addSection("Executive Summary", data.executiveSummary);
    addSection("Company Description", data.companyDescription);
    
    checkPageBreak();
    doc.setFontSize(16);
    doc.text("Market Analysis", 14, current_y);
    current_y += 8;
    
    const addSubSection = (title: string, content: string) => {
        checkPageBreak();
        doc.setFontSize(14);
        doc.text(title, 14, current_y);
        current_y += 6;
        doc.setFontSize(12);
        const splitContent = doc.splitTextToSize(cleanText(content), 170);
        doc.text(splitContent, 20, current_y);
        current_y += splitContent.length * 7 + 5;
    };

    addSubSection("Industry Overview", data.marketAnalysis.industryOverview);
    addSubSection("Target Market", data.marketAnalysis.targetMarket);
    addSubSection("Competitive Analysis", data.marketAnalysis.competitiveAnalysis);
    
    current_y += 5;

    addSection("Organization and Management", data.organizationAndManagement);
    addSection("Products and Services", data.productsAndServices);
    addSection("Marketing and Sales Strategy", data.marketingAndSalesStrategy);

    addSection("Financial Projections", data.financialProjections.summary);

    checkPageBreak();

    autoTable(doc, {
        startY: current_y,
        head: [['Year', 'Revenue', 'COGS', 'Net Profit']],
        body: data.financialProjections.forecast.map(item => [item.year, item.revenue, item.cogs, item.netProfit]),
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
        didDrawPage: (data) => {
            current_y = data.cursor.y + 10;
        }
    });

    doc.save('business-plan.pdf');
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="spinner"></div>
        <p className="mt-6 text-xl font-semibold animate-pulse">
          AI is drafting your comprehensive business plan...
        </p>
      </div>
    );
  }

  if (!businessPlanData) {
    return (
      <div className="text-center p-12">
        <h3 className="text-3xl font-bold mb-4">Generate Your Business Plan</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
          Let our AI create a detailed 7-part business plan for your startup, covering everything from executive summary to financial projections.
        </p>
        <button onClick={handleGenerate} className="cta-button">
          Generate Business Plan
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  const data = businessPlanData;
  const idea = startup.name || '';

  return (
    <div className="business-plan-container">
        <div className="bp-header">
            <div className="bp-title-section">
                <h2>Business Plan</h2>
                <p>{idea}</p>
            </div>
            <button onClick={handleDownloadPDF} className="download-button">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                <span className="button-text">Download PDF</span>
            </button>
        </div>

        <Section title="Executive Summary">
            <p>{cleanText(data.executiveSummary)}</p>
        </Section>

        <Section title="Company Description">
            <p>{cleanText(data.companyDescription)}</p>
        </Section>

        <Section title="Market Analysis">
            <SubSection title="Industry Overview">{cleanText(data.marketAnalysis.industryOverview)}</SubSection>
            <SubSection title="Target Market">{cleanText(data.marketAnalysis.targetMarket)}</SubSection>
            <SubSection title="Competitive Analysis">{cleanText(data.marketAnalysis.competitiveAnalysis)}</SubSection>
        </Section>

        <Section title="Organization and Management">
            <p>{cleanText(data.organizationAndManagement)}</p>
        </Section>

        <Section title="Products and Services">
            <p>{cleanText(data.productsAndServices)}</p>
        </Section>

        <Section title="Marketing and Sales Strategy">
            <p>{cleanText(data.marketingAndSalesStrategy)}</p>
        </Section>

        <Section title="Financial Projections">
            <p>{cleanText(data.financialProjections.summary)}</p>
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
                        {data.financialProjections.forecast.map((item) => (
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

    </div>
  );
};
