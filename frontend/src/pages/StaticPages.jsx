import React from 'react';
import { Helmet } from 'react-helmet-async';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-label font-semibold text-xl text-brown-deep mb-3">{title}</h2>
    <div className="text-brown-light leading-relaxed space-y-3">{children}</div>
  </div>
);

export const Terms = () => (
  <>
    <Helmet><title>Terms of Service | Crochet Nest</title></Helmet>
    <div className="section-padding">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl mb-8">Terms of Service</h1>
        <Section title="1. Overview">
          <p>By using Crochet Nest, you agree to these terms. We reserve the right to update them at any time; continued use of the site constitutes acceptance of any changes.</p>
        </Section>
        <Section title="2. Orders & Payments">
          <p>All orders are subject to availability. Prices are listed in INR and are inclusive of applicable taxes unless stated otherwise. We accept payments via Razorpay and Cash on Delivery.</p>
        </Section>
        <Section title="3. Custom Orders">
          <p>Custom crochet requests are quoted individually based on complexity and materials. Quotes must be accepted before work begins. Custom pieces are made-to-order and may not be eligible for standard returns.</p>
        </Section>
        <Section title="4. Account Responsibility">
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
        </Section>
        <Section title="5. Prohibited Use">
          <p>Accounts found engaging in fraudulent orders, abuse, or violation of these terms may be blocked at our discretion.</p>
        </Section>
      </div>
    </div>
  </>
);

export const PrivacyPolicy = () => (
  <>
    <Helmet><title>Privacy Policy | Crochet Nest</title></Helmet>
    <div className="section-padding">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl mb-8">Privacy Policy</h1>
        <Section title="Information We Collect">
          <p>We collect information you provide directly — name, email, phone number, shipping addresses — as well as order and browsing history to improve your experience.</p>
        </Section>
        <Section title="How We Use Your Information">
          <p>Your information is used to process orders, provide customer support, send transactional emails, and — with your consent — marketing communications.</p>
        </Section>
        <Section title="Data Security">
          <p>We use industry-standard encryption and security practices, including secure password hashing and encrypted payment processing via Razorpay, to protect your data.</p>
        </Section>
        <Section title="Third-Party Services">
          <p>We use trusted third parties (Cloudinary for image hosting, Razorpay for payments, Google for optional sign-in) who process data solely to provide their respective services.</p>
        </Section>
        <Section title="Your Rights">
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting hello@crochetnest.com.</p>
        </Section>
      </div>
    </div>
  </>
);

export const FAQ = () => {
  const faqs = [
    { q: 'How long does shipping take?', a: 'Most in-stock items ship within 2-4 business days and arrive within 5-7 business days. Custom orders vary based on crafting time.' },
    { q: 'Can I customize the color of a product?', a: 'Many products offer color variants at checkout. For fully custom pieces, use our Custom Order form.' },
    { q: 'What is your return policy?', a: 'Unworn, unused items in original condition can be returned within 7 days of delivery. Custom-made pieces are final sale unless defective.' },
    { q: 'Do you ship internationally?', a: 'Currently we ship within India only. International shipping is coming soon!' },
    { q: 'How do I track my order?', a: 'Once shipped, tracking details appear on your Order Detail page under My Account → My Orders.' },
  ];

  return (
    <>
      <Helmet><title>FAQs | Crochet Nest</title></Helmet>
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl mb-8">Frequently Asked Questions</h1>
          <div className="space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="card-cozy p-5">
                <h3 className="font-label font-semibold text-brown-deep mb-2">{item.q}</h3>
                <p className="text-brown-light text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const ShippingReturns = () => (
  <>
    <Helmet><title>Shipping &amp; Returns | Crochet Nest</title></Helmet>
    <div className="section-padding">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl mb-8">Shipping &amp; Returns</h1>
        <Section title="Shipping">
          <p>We offer free shipping on orders over ₹1,499. Orders below that threshold have a flat shipping fee of ₹99. Standard delivery takes 5-7 business days across India.</p>
        </Section>
        <Section title="Custom Order Timelines">
          <p>Custom pieces typically take 3-10 business days to craft, depending on complexity, plus standard shipping time. Your quote will include an estimated timeline.</p>
        </Section>
        <Section title="Returns & Exchanges">
          <p>We accept returns on unworn, unused items within 7 days of delivery. To start a return, contact us at hello@crochetnest.com with your order number.</p>
        </Section>
        <Section title="Damaged or Incorrect Items">
          <p>If your order arrives damaged or incorrect, please reach out within 48 hours of delivery with photos, and we'll make it right at no extra cost.</p>
        </Section>
      </div>
    </div>
  </>
);
