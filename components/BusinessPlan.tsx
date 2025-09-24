
import React from 'react';
import { BusinessPlanData } from '../types';

interface BusinessPlanProps {
    data: BusinessPlanData;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-indigo-400 mb-3">{title}</h3>
        <p className="text-slate-300 leading-relaxed">{children}</p>
    </div>
);

export const BusinessPlan: React.FC<BusinessPlanProps> = ({ data }) => {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Business Plan</h2>
                <p className="text-lg italic text-slate-400 mt-2">"{data.slogan}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Problem">{data.problem}</Section>
                <Section title="Solution">{data.solution}</Section>
                <Section title="Target Audience">{data.targetAudience}</Section>
                <Section title="Revenue Model">{data.revenueModel}</Section>
            </div>
        </div>
    );
};
