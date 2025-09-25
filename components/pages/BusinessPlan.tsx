
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessPlanData } from '../../types';

interface BusinessPlanProps {
    data: BusinessPlanData;
    idea: string;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-2xl font-bold text-[var(--primary-color)] border-b-2 border-[var(--primary-color)] pb-2 mb-4">{title}</h3>
        <div className="text-[var(--text-slate-300)] leading-relaxed space-y-4">{children}</div>
    </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4">
        <h4 className="text-lg font-semibold text-[var(--text-slate-100)] mb-2">{title}</h4>
        <p>{children}</p>
    </div>
);

export const BusinessPlan: React.FC<BusinessPlanProps> = ({ data, idea }) => {

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const margin = 15;
        let y = margin;

        const addTitle = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text('Business Plan', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += 10;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text(`Venture: ${idea}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += 20;
        };

        const addSection = (title: string, content: string | string[]) => {
            if (y > doc.internal.pageSize.getHeight() - 30) {
                doc.addPage();
                y = margin;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(title, margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const splitContent = doc.splitTextToSize(content, doc.internal.pageSize.getWidth() - margin * 2);
            doc.text(splitContent, margin, y);
            y += (Array.isArray(splitContent) ? splitContent.length : 1) * 5 + 10;
        };

        addTitle();

        addSection('Executive Summary', data.executiveSummary);
        addSection('Company Description', data.companyDescription);
        
        // Market Analysis Section
        addSection('Market Analysis', '');
        y -= 5; // Adjust space
        addSection('  - Industry Overview', data.marketAnalysis.industryOverview);
        addSection('  - Target Market', data.marketAnalysis.targetMarket);
        addSection('  - Competitive Analysis', data.marketAnalysis.competitiveAnalysis);

        addSection('Organization and Management', data.organizationAndManagement);
        addSection('Products and Services', data.productsAndServices);
        addSection('Marketing and Sales Strategy', data.marketingAndSalesStrategy);

        // Financial Projections Section
        addSection('Financial Projections', data.financialProjections.summary);
        
        autoTable(doc, {
            startY: y,
            head: [['Year', 'Revenue', 'COGS', 'Net Profit']],
            body: data.financialProjections.forecast.map(f => [f.year, f.revenue, f.cogs, f.netProfit]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`Business-Plan-${idea.replace(/\s+/g, '-')}.pdf`);
    };

    return (
        <div className="bg-[var(--bg-slate-900)]/50 p-6 sm:p-8 md:p-10 rounded-lg border border-[var(--border-slate-700)]">
            <div className="flex justify-between items-start mb-10">
                <div className="text-left">
                    <h2 className="text-4xl font-bold text-[var(--text-color)]">Business Plan</h2>
                    <p className="text-xl text-[var(--text-slate-400)] mt-2">{idea}</p>
                </div>
                <button 
                    onClick={handleDownloadPDF}
                    className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-colors duration-300 flex items-center gap-2 whitespace-nowrap"
                >
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
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-[var(--text-slate-300)]">
                        <thead className="text-xs text-[var(--text-slate-200)] uppercase bg-[var(--bg-slate-800)]">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Year</th>
                                <th scope="col" className="px-6 py-3">Revenue</th>
                                <th scope="col" className="px-6 py-3">COGS</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.financialProjections.forecast.map((item) => (
                                <tr key={item.year} className="bg-[var(--bg-slate-900)] border-b border-[var(--border-slate-700)]">
                                    <td className="px-6 py-4 font-medium">Year {item.year}</td>
                                    <td className="px-6 py-4">{item.revenue}</td>
                                    <td className="px-6 py-4">{item.cogs}</td>
                                    <td className="px-6 py-4">{item.netProfit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

        </div>
    );
};
