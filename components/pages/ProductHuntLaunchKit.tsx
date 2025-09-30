import React, { useState, useEffect, useMemo } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './ProductHuntLaunchKit.css';

interface ProductHuntLaunchKitProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    productHuntKit?: string;
    businessPlan?: string;
    marketingCopy?: string;
    brandIdentity?: string;
    missionVision?: string;
  };
}

// Expanded KitData interface
interface KitData {
  taglines: string[];
  makersComment: {
    problem: string;
    solution: string;
    callToAction: string;
  };
  tweetSequence: Array<{ time: string; content: string; }>;
  visualAssetIdeas: Array<{ idea: string; description: string; }>;
  announcementEmail: {
    subject: string;
    body: string;
  };
  linkedinPost: string;
  thankYouTweet: string;
}


// --- Helper function for copying to clipboard ---
const copyToClipboard = (text: string, fieldName: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${fieldName} copied to clipboard!`)
  }, (err) => {
    console.error('Could not copy text: ', err);
    toast.error('Failed to copy text.');
  });
};

// --- The main component ---
const ProductHuntLaunchKit: React.FC<ProductHuntLaunchKitProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const generateKitAction = useAction(api.actions.generateProductHuntKit);

  const kitData: KitData | null = useMemo(() => {
    if (!startup.productHuntKit) return null;
    try {
      return JSON.parse(startup.productHuntKit);
    } catch (e) {
      console.error("Failed to parse Product Hunt Kit data:", e);
      toast.error("Failed to load existing launch kit data.");
      return null;
    }
  }, [startup.productHuntKit]);

  const loadingTexts = [
    "Analyzing your startup's DNA...",
    "Crafting the perfect tagline...",
    "Writing a compelling maker's comment...",
    "Generating viral tweet ideas...",
    "Assembling your launch assets...",
    "Prepping subscriber emails...",
    "Drafting professional announcements..."
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.businessPlan && !!startup.marketingCopy && !!startup.brandIdentity && !!startup.missionVision;

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
  }, [isGenerating, loadingTexts]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete the previous Go-to-Market steps first.");
      return;
    }
    setIsGenerating(true);
    try {
      await generateKitAction({ startupId: startup._id });
      toast.success("Product Hunt Launch Kit generated!");
    } catch (err: any) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate Launch Kit", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="rocket-animation-container">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="star"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
        <div className="rocket">
          <div className="rocket-body">
            <div className="fin fin-left"></div>
            <div className="fin fin-right"></div>
          </div>
          <div className="flame"></div>
        </div>
      </div>
      <div className="mobile-spinner"></div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = (data: KitData) => (
    <div className="results-grid full-width">
      {/* Taglines Card */}
      {data.taglines && (
        <div className="result-card span-2">
          <div className="card-header">
            <i className="fas fa-tags"></i>
            <h3>Tagline Options</h3>
          </div>
          <div className="card-content">
            <ul className="tagline-list">
              {data.taglines.map((tagline, index) => (
                <li key={index}>
                  <span>{tagline}</span>
                  <button onClick={() => copyToClipboard(tagline, `Tagline ${index + 1}`)} className="copy-button-small" title="Copy">
                    <i className="far fa-copy"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Maker's Comment Card */}
      {data.makersComment && (
        <div className="result-card span-2">
          <div className="card-header">
            <i className="fas fa-comment-dots"></i>
            <h3>Maker's Comment</h3>
          </div>
          <div className="card-content structured-comment">
              <h4>The Problem:</h4>
              <p>{data.makersComment.problem}</p>
              <h4>Our Solution:</h4>
              <p>{data.makersComment.solution}</p>
              <h4>A Question for You:</h4>
              <p className="call-to-action">{data.makersComment.callToAction}</p>
              <button onClick={() => copyToClipboard(`${data.makersComment.problem}\n\n${data.makersComment.solution}\n\n${data.makersComment.callToAction}`, 'Maker\'s Comment')} className="copy-button" title="Copy all">
                  <i className="far fa-copy"></i>
              </button>
          </div>
        </div>
      )}

      {/* Tweet Sequence Card */}
      {data.tweetSequence && data.tweetSequence.length > 0 && (
        <div className="result-card span-3">
          <div className="card-header">
            <i className="fab fa-twitter"></i>
            <h3>Launch Day Tweet Sequence</h3>
          </div>
          <div className="card-content">
            <div className="tabs">
              {data.tweetSequence.map((tweet, index) => (
                <button key={index} className={`tab-button ${activeTab === index ? 'active' : ''}`} onClick={() => setActiveTab(index)}>
                  {tweet.time}
                </button>
              ))}
            </div>
            <div className="tab-content">
              <p>{data.tweetSequence[activeTab]?.content}</p>
              <button onClick={() => copyToClipboard(data.tweetSequence[activeTab]?.content, `Tweet ${activeTab + 1}`)} className="copy-button" title="Copy">
                <i className="far fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Asset Ideas Card */}
      {data.visualAssetIdeas && (
        <div className="result-card span-3">
          <div className="card-header">
            <i className="fas fa-lightbulb"></i>
            <h3>Visual Asset Ideas</h3>
          </div>
          <div className="card-content">
            <ul className="visual-ideas-list">
              {data.visualAssetIdeas.map((asset, index) => (
                <li key={index}>
                  <strong>{asset.idea}</strong>
                  <p>{asset.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Communication Card (Email & LinkedIn) */}
      {data.announcementEmail && data.linkedinPost && (
        <div className="result-card span-2">
          <div className="card-header">
            <i className="fas fa-bullhorn"></i>
            <h3>Launch Announcements</h3>
          </div>
          <div className="card-content communication-card">
              <div className="sub-section">
                  <h4><i className="fas fa-envelope"></i> Subscriber Email</h4>
                  <p><strong>Subject:</strong> {data.announcementEmail.subject}</p>
                  <p className="email-body">{data.announcementEmail.body}</p>
                  <button onClick={() => copyToClipboard(`Subject: ${data.announcementEmail.subject}\n\n${data.announcementEmail.body}`, 'Email Content')} className="copy-button" title="Copy Email">
                      <i className="far fa-copy"></i>
                  </button>
              </div>
              <div className="sub-section">
                  <h4><i className="fab fa-linkedin"></i> LinkedIn Post</h4>
                  <p>{data.linkedinPost}</p>
                  <button onClick={() => copyToClipboard(data.linkedinPost, 'LinkedIn Post')} className="copy-button" title="Copy Post">
                      <i className="far fa-copy"></i>
                  </button>
              </div>
          </div>
        </div>
      )}

      {/* Thank You Tweet Card */}
      {data.thankYouTweet && (
        <div className="result-card span-1">
          <div className="card-header">
            <i className="fas fa-heart"></i>
            <h3>Post-Launch Thanks</h3>
          </div>
          <div className="card-content">
            <p>{data.thankYouTweet}</p>
            <button onClick={() => copyToClipboard(data.thankYouTweet, 'Thank You Tweet')} className="copy-button" title="Copy">
              <i className="far fa-copy"></i>
            </button>
          </div>
        </div>
      )}

    </div>
  );

  const hasContent = !!kitData || isGenerating;

  return (
    <div className="ph-launch-kit-container">
      {hasContent && (
        <TaskResultHeader title="Product Hunt Launch Kit" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : kitData ? renderResults(kitData) : (
        <InitialTaskView
            title="Prepare for Launch!"
            description="Generate a comprehensive suite of assets for a successful Product Hunt launch, from taglines and tweets to emails and post ideas."
            buttonText="Generate Full Launch Kit"
            onAction={handleGenerate}
            disabled={!canGenerate}
            buttonIcon={<i className="fas fa-rocket"></i>}
        />
      )}
    </div>
  );
};

export default ProductHuntLaunchKit;
