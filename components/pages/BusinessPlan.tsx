
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
            const splitContent = doc.splitTextToSize(content, 180);
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
            const splitContent = doc.splitTextToSize(content, 170);
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
