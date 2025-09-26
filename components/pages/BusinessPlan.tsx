
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessPlanData } from '../../types';
import './BusinessPlan.css';

interface BusinessPlanProps {
    data: BusinessPlanData;
    idea: string;
}

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

export const BusinessPlan: React.FC<BusinessPlanProps> = ({ data, idea }) => {

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        // ... PDF generation logic remains the same
    };

    return (
        <div className="business-plan-container">
            <div className="bp-header">
                <div className="bp-title-section">
                    <h2>Business Plan</h2>
                    <p>{idea}</p>
                </div>
                <button onClick={handleDownloadPDF} className="download-button">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    Download PDF
                </button>
            </div>

            <Section title="Executive Summary">
                <p>{data.executiveSummary}</p>
            </Section>

            <Section title="Company Description">
                <p>{data.companyDescription}</p>
            </Section>

            <Section title="Market Analysis">
                <SubSection title="Industry Overview">{data.marketAnalysis.industryOverview}</SubSection>
                <SubSection title="Target Market">{data.marketAnalysis.targetMarket}</SubSection>
                <SubSection title="Competitive Analysis">{data.marketAnalysis.competitiveAnalysis}</SubSection>
            </Section>

            <Section title="Organization and Management">
                <p>{data.organizationAndManagement}</p>
            </Section>

            <Section title="Products and Services">
                <p>{data.productsAndServices}</p>
            </Section>

            <Section title="Marketing and Sales Strategy">
                <p>{data.marketingAndSalesStrategy}</p>
            </Section>

            <Section title="Financial Projections">
                <p>{data.financialProjections.summary}</p>
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
