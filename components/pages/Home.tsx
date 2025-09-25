import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoSection } from './InfoSection';
import { GrowthSection } from './GrowthSection';
import { TransformSection } from './TransformSection';
import { IdeaInputForm } from './IdeaInputForm';

import { ScrollAndHighlightProvider } from '../../contexts/ScrollAndHighlightContext'; // Import the provider

import { Reveal } from '../Reveal'; // Import Reveal component

export const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleGenerate = (idea: string) => {
        navigate(`/build?idea=${idea}`);
    };

    return (
        <ScrollAndHighlightProvider>
            <IdeaInputForm onGenerate={handleGenerate} />
            <Reveal delay={200}> {/* Add a slight delay for sequential animation */}
                <InfoSection />
            </Reveal>
            <Reveal delay={400}>
                <GrowthSection />
            </Reveal>
            <Reveal delay={600}>
                <TransformSection />
            </Reveal>
        </ScrollAndHighlightProvider>
    );
};
