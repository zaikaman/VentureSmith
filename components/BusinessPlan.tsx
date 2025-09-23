import React from 'react';
import { BusinessPlanData } from '../types';

interface BusinessPlanProps {
    data: BusinessPlanData;
}

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800/50 p-6 rounded-2xl border border-gray-800/80 ${className}`}>
        <h3 className="text-xl font-bold text-indigo-400 mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{children}</p>
    </div>
);

export const BusinessPlan: React.FC<BusinessPlanProps> = ({ data }) => {
    return (
        <div>
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white">Business Plan</h2>
                <p className="text-xl italic text-gray-400 mt-3">"{data.slogan}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Problem">{data.problem}</Section>
                <Section title="Solution">{data.solution}</Section>
                <Section title="Target Audience" className="md:col-span-2">{data.targetAudience}</Section>
                <Section title="Revenue Model" className="md:col-span-2">{data.revenueModel}</Section>
            </div>
        </div>
    );
};