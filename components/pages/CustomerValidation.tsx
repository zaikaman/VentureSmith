import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import './CustomerValidation.css';

interface CustomerPersona {
  name: string;
  demographics: any;
  problem: string;
  feedback: any;
}

interface CustomerValidationProps {
  startup: {
    _id: Id<"startups">;
    name?: string | undefined;
    customerValidation?: string | undefined;
    // Add other startup properties if needed
  };
}

const CustomerValidation: React.FC<CustomerValidationProps> = ({ startup }) => {
  const getCustomerValidation = useAction(api.actions.getCustomerValidation);
  const [personas, setPersonas] = useState<CustomerPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValidation = async () => {
      if (startup.customerValidation) {
        setPersonas(JSON.parse(startup.customerValidation));
        setIsLoading(false);
        return;
      }

      if (!startup.name) {
        setError("Startup name is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getCustomerValidation({
          startupId: startup._id,
          startupName: startup.name,
          startupDescription: "A brief description of the startup.", // We can pass a better description later
        });
        setPersonas(result);
      } catch (err: any) {
        setError("Failed to get customer validation feedback. Please try again.");
        console.error("Error getting customer validation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchValidation();
  }, [startup, getCustomerValidation]);

  const renderDemographics = (demographics: any) => {
    if (typeof demographics === 'string') {
      return demographics;
    }
    if (typeof demographics === 'object' && demographics !== null) {
      return Object.values(demographics).join(', ');
    }
    return null;
  };

  const renderFeedback = (feedback: any) => {
    if (typeof feedback === 'string') {
      return <p>{feedback}</p>;
    }
    if (typeof feedback === 'object' && feedback !== null) {
      return (
        <>
          {feedback.likes && <p><strong>Likes:</strong> {feedback.likes}</p>}
          {feedback.concerns && <p><strong>Concerns:</strong> {feedback.concerns}</p>}
          {feedback.questions && <p><strong>Questions:</strong> {feedback.questions}</p>}
        </>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="spinner"></div>
        <p className="mt-6 text-xl font-semibold animate-pulse">
          Simulating feedback from potential customers...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="customer-validation-container">
      <h2 className="text-3xl font-bold mb-6">Simulated Customer Feedback</h2>
      <div className="personas-grid">
        {personas.map((persona, index) => (
          <div key={index} className="persona-card">
            <h3 className="persona-name">{persona.name}</h3>
            <p className="persona-demographics">{renderDemographics(persona.demographics)}</p>
            <div className="persona-section">
              <h4>Problem/Need:</h4>
              <p>{persona.problem}</p>
            </div>
            <div className="persona-section">
              <h4>Feedback:</h4>
              {renderFeedback(persona.feedback)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerValidation;