import React from 'react';
import './StaticPage.css';

const PrivacyPage: React.FC = () => {
  return (
    <div className="static-page-container">
      <div className="static-page-content">
        <h1 className="static-page-title">Privacy Policy</h1>
        <div className="static-page-section">
          <p className="text-sm text-gray-500 mb-4">Last Updated: September 29, 2025</p>
          <p>
            Your privacy is important to us. It is VentureSmith's policy to respect your privacy regarding any information we may collect from you across our website.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">1. Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
          <p className="mt-4">
            The information we collect may include your name, email address, and the business ideas and related content you provide to the Service.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to operate, maintain, and provide you with the features and functionality of the Service. The business-related information you provide is used to generate the AI-powered outputs that are core to our service offering.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">3. Data Security</h2>
          <p>
            We take data security seriously. We protect the information we collect with commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use, or modification. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">4. Third-Party Services</h2>
          <p>
            Our Service may use third-party services for AI processing, database management, and authentication. These third parties may have access to your data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">5. Your Rights</h2>
          <p>
            You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. You have the right to access, update, or delete your personal information at any time through your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
