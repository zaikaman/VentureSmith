import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoSection } from './InfoSection';
import { GrowthSection } from './GrowthSection';
import { TransformSection } from './TransformSection';
import { IdeaInputForm } from './IdeaInputForm';

export const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleGenerate = (idea: string) => {
        navigate(`/build?idea=${idea}`);
    };

    return (
        <>
            <IdeaInputForm onGenerate={handleGenerate} />
            <InfoSection />
            <GrowthSection />
            <TransformSection />
        </>
    );
};
