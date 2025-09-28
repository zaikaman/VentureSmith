import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import './GenerateMarketingCopy.css';

// Data structures for the marketing copy
interface AdCopy {
  headline1: string;
  headline2: string;
  description: string;
}

interface FacebookAdCopy {
    headline: string;
    primaryText: string;
    callToAction: string;
}

interface MarketingData {
  taglines: string[];
  socialMediaPosts: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };
  adCopy: {
    googleAds: AdCopy;
    facebookAd: FacebookAdCopy;
  };
  emailCampaign: {
    subject: string;
    body: string;
  };
}

interface GenerateMarketingCopyProps {
  startup: {
    _id: Id<"startups">;
    marketingCopy?: string;
    brandIdentity?: string;
    missionVision?: string;
    customerPersonas?: string;
    pricingStrategy?: string;
  };
}

const CopyToClipboardButton = ({ text }: { text: string }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };
    return (
        <button onClick={handleCopy} className="copy-button" title="Copy to clipboard">
            <i className="fas fa-copy"></i>
        </button>
    );
};

const GenerateMarketingCopy: React.FC<GenerateMarketingCopyProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyData, setCopyData] = useState<MarketingData | null>(null);

  const generateCopyAction = useAction(api.actions.generateMarketingCopy);

  const loadingTexts = [
    "Analyzing brand identity...",
    "Understanding target personas...",
    "Crafting compelling taglines...",
    "Writing social media posts...",
    "Building ad campaigns...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brandIdentity && !!startup.customerPersonas && !!startup.pricingStrategy;

  useEffect(() => {
    if (startup.marketingCopy) {
      try {
        setCopyData(JSON.parse(startup.marketingCopy));
      } catch (e) {
        console.error("Failed to parse marketing copy:", e);
        setCopyData(null);
      }
    }
  }, [startup.marketingCopy]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete Brand Identity, Customer Personas, and Pricing Strategy first.");
      return;
    }
    setIsGenerating(true);
    setCopyData(null);
    try {
      const resultString = await generateCopyAction({ startupId: startup._id });
      setCopyData(JSON.parse(resultString));
      toast.success("Marketing Copy generated successfully!");
    } catch (err: any) {
      console.error("Copy generation failed:", err);
      toast.error("Failed to generate Marketing Copy", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
        <div className="megaphone-animation-container">
            <i className="fas fa-bullhorn megaphone-icon"></i>
            <div className="sound-wave wave-1"></div>
            <div className="sound-wave wave-2"></div>
            <div className="floating-word word-1">Brand</div>
            <div className="floating-word word-2">Value</div>
            <div className="floating-word word-3">Growth</div>
            <div className="floating-word word-4">Users</div>
        </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => {
    if (!copyData) return null;

    return (
      <div className="copy-results-container">
        {/* Taglines Section */}
        <div className="copy-section">
            <div className="copy-section-header"><i className="fas fa-tags"></i> Taglines</div>
            <div className="copy-section-content tagline-grid">
                {copyData.taglines.map((tagline, i) => <div key={i} className="tagline-card">"{tagline}"</div>)}
            </div>
        </div>

        {/* Social Media Section */}
        <div className="copy-section">
            <div className="copy-section-header"><i className="fas fa-share-alt"></i> Social Media Posts</div>
            <div className="copy-section-content social-grid">
                <div className="social-card">
                    <h4 className="card-title"><i className="fab fa-linkedin"></i> LinkedIn</h4>
                    <p className="card-content">{copyData.socialMediaPosts.linkedin}</p>
                    <CopyToClipboardButton text={copyData.socialMediaPosts.linkedin} />
                </div>
                <div className="social-card">
                    <h4 className="card-title"><i className="fab fa-twitter"></i> Twitter / X</h4>
                    <p className="card-content">{copyData.socialMediaPosts.twitter}</p>
                    <CopyToClipboardButton text={copyData.socialMediaPosts.twitter} />
                </div>
                <div className="social-card">
                    <h4 className="card-title"><i className="fab fa-facebook"></i> Facebook</h4>
                    <p className="card-content">{copyData.socialMediaPosts.facebook}</p>
                    <CopyToClipboardButton text={copyData.socialMediaPosts.facebook} />
                </div>
            </div>
        </div>

        {/* Ad Copy Section */}
        <div className="copy-section">
            <div className="copy-section-header"><i className="fas fa-ad"></i> Advertisement Copy</div>
            <div className="copy-section-content ad-grid">
                <div className="ad-card">
                    <h4 className="card-title"><i className="fab fa-google"></i> Google Ads</h4>
                    <div className="card-content">
                        <div className="ad-headline">{copyData.adCopy.googleAds.headline1}</div>
                        <div className="ad-headline">{copyData.adCopy.googleAds.headline2}</div>
                        <p>{copyData.adCopy.googleAds.description}</p>
                    </div>
                    <CopyToClipboardButton text={`${copyData.adCopy.googleAds.headline1}\n${copyData.adCopy.googleAds.headline2}\n${copyData.adCopy.googleAds.description}`} />
                </div>
                <div className="ad-card">
                    <h4 className="card-title"><i className="fab fa-facebook"></i> Facebook Ads</h4>
                    <div className="card-content">
                        <div className="ad-headline">{copyData.adCopy.facebookAd.headline}</div>
                        <p>{copyData.adCopy.facebookAd.primaryText}</p>
                    </div>
                    <CopyToClipboardButton text={`${copyData.adCopy.facebookAd.headline}\n${copyData.adCopy.facebookAd.primaryText}`} />
                </div>
            </div>
        </div>

        {/* Email Section */}
        <div className="copy-section">
            <div className="copy-section-header"><i className="fas fa-envelope"></i> Email Campaign</div>
            <div className="copy-section-content">
                <div className="email-card">
                    <h4 className="card-title">Subject: {copyData.emailCampaign.subject}</h4>
                     <p className="card-content">{copyData.emailCampaign.body}</p>
                    </div>
                <CopyToClipboardButton text={`Subject: ${copyData.emailCampaign.subject}\n\n${copyData.emailCampaign.body}`} />
            </div>
        </div>
      </div>
    );
  };

  const hasContent = copyData || isGenerating;

  return (
    <div className="marketing-copy-container">
      {hasContent && (
        <TaskResultHeader title="Marketing Copy" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : copyData ? renderResults() : (
        <InitialTaskView
            title="Generate AI-Powered Marketing Copy"
            description="Create a complete set of marketing materials, from taglines to social media posts and ad copy, all tailored to your brand and target audience."
            buttonText="Generate Marketing Copy"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default GenerateMarketingCopy;
