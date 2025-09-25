import React from 'react';
import './MentorFeedbackDisplay.css';

interface MentorFeedbackDisplayProps {
    feedback: string;
}

// Helper function to parse a section and return title and items
const parseSection = (text: string, titlePrefix: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const title = lines.shift()?.replace(titlePrefix, '').trim() || '';
    const items = lines.map(line => line.replace(/\*\s*/, '').trim());
    return { title, items };
};

export const MentorFeedbackDisplay: React.FC<MentorFeedbackDisplayProps> = ({ feedback }) => {
    const sections = feedback.split('---').map(s => s.trim());

    const scoreSection = sections.find(s => s.includes('Overall Investability Score'));
    const strengthsSection = sections.find(s => s.includes('Key Strengths'));
    const risksSection = sections.find(s => s.includes('Potential Risks & Weaknesses'));
    const questionsSection = sections.find(s => s.includes('Critical Investor Questions'));

    const scoreMatch = scoreSection?.match(/(\d+)\s*\/\s*10/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
    const justificationMatch = scoreSection?.match(/\*\*Justification:\*\*\s*(.*)/);
    const justification = justificationMatch ? justificationMatch[1] : 'No justification provided.';

    const { items: strengths } = strengthsSection ? parseSection(strengthsSection, '### Key Strengths') : { items: [] };
    const { items: risks } = risksSection ? parseSection(risksSection, '### Potential Risks & Weaknesses') : { items: [] };
    const { items: questions } = questionsSection ? parseSection(questionsSection, '### Critical Investor Questions') : { items: [] };

    const sectionData = [
        { title: 'Key Strengths', items: strengths, className: 'strengths' },
        { title: 'Potential Risks & Weaknesses', items: risks, className: 'risks' },
        { title: 'Critical Investor Questions', items: questions, className: 'questions' },
    ];

    return (
        <div className="feedback-container">
            {score !== null && (
                <div className="feedback-section score-card">
                    <div className="score-circle">
                        <div className="score-circle-inner">
                            <div className="score-text">{score}</div>
                            <div className="score-label">/ 10</div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Overall Investability Score</h3>
                    <p className="score-justification">{justification}</p>
                </div>
            )}

            {sectionData.map((section, index) => (
                section.items.length > 0 && (
                    <div key={index} className={`feedback-section ${section.className}`}>
                        <h3>{section.title}</h3>
                        <div className="content">
                            <ul>
                                {section.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )
            ))}
        </div>
    );
};