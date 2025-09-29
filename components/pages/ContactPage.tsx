import React from 'react';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  return (
    <div className="static-page-container">
      <div className="static-page-content">
        <h1 className="static-page-title">Contact Us</h1>
        <div className="static-page-section">
          <p>
            We'd love to hear from you. Whether you have a question about our features, a suggestion for the platform, or need support, please don't hesitate to reach out.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">Get in Touch</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <h3>General Inquiries</h3>
              <p>For all general questions, please email us at:</p>
              <a href="mailto:hello@venturesmith.com">hello@venturesmith.com</a>
            </div>
            <div className="contact-method">
              <h3>Support</h3>
              <p>If you need help with your account or have technical questions, contact our support team:</p>
              <a href="mailto:support@venturesmith.com">support@venturesmith.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
