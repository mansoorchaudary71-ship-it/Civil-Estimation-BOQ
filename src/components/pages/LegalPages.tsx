import React from 'react';
import { FileText, Shield, Cookie, ArrowRight } from 'lucide-react';
import { ModuleId } from '../Dashboard';
import { SEO } from '../SEO';

type LegalPageProps = {
  page: 'privacy' | 'terms' | 'cookies';
  onNavigate: (id: ModuleId) => void;
};

const PAGE_DEFINITIONS = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    description: 'Learn how we collect, use, and protect your data.',
    date: 'Last updated: May 15, 2026'
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    description: 'The rules and guidelines for using our platform.',
    date: 'Last updated: May 15, 2026'
  },
  cookies: {
    title: 'Cookie Policy',
    icon: Cookie,
    description: 'Information about how we use cookies and tracking.',
    date: 'Last updated: May 15, 2026'
  }
};

export default function LegalPages({ page, onNavigate }: LegalPageProps) {
  const current = PAGE_DEFINITIONS[page];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title={`${current.title} | Civil Estimation Pro`} 
        description={current.description} 
      />
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4 md:pt-8 bg-white/50 dark:bg-slate-900/50 p-8 md:p-12 rounded-[3rem]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-100/50 dark:bg-blue-900/30 text-indigo-600 dark:text-blue-400 mb-4 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.2)] overflow-hidden">
          <current.icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          {current.title}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {current.description}
        </p>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-6">
          {current.date}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky top-24 self-start">
          <div className="bg-bg-card p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 overflow-hidden">
            <h3 className="text-base font-medium dark:text-slate-500 uppercase tracking-widest pl-3 mb-4">
              Legal Pages
            </h3>
            
            <button
              onClick={() => onNavigate('privacy')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                page === 'privacy' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <span className="flex items-center gap-3">
                <Shield className="w-4 h-4" /> Privacy Policy
              </span>
              {page === 'privacy' && <ArrowRight className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => onNavigate('terms')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                page === 'terms' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4" /> Terms of Service
              </span>
              {page === 'terms' && <ArrowRight className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => onNavigate('cookies')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                page === 'cookies' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <span className="flex items-center gap-3">
                <Cookie className="w-4 h-4" /> Cookie Policy
              </span>
              {page === 'cookies' && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="mt-6 bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 text-sm overflow-hidden">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Have Questions?</h4>
            <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              If you have any questions about our legal policies, please contact our support team.
            </p>
            <button 
              onClick={() => onNavigate('contact')}
              className="text-indigo-600 dark:text-blue-400 font-bold hover:underline mt-2 inline-flex items-center gap-1.5"
            >
              Contact Support <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-bg-card p-8 md:p-12 lg:p-16 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-blue-400 transition-colors">
            {page === 'privacy' && <PrivacyContent />}
            {page === 'terms' && <TermsContent />}
            {page === 'cookies' && <CookiesContent />}
          </div>
        </main>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <p>
        At Civil Estimation Pro ("Company," "we," "us," or "our"), we respect your privacy and are committed to protecting it through our compliance with this policy.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect several types of information from and about users of our SaaS platform, including:</p>
      <ul>
        <li><strong>Personal Information:</strong> Includes email addresses, names, and contact details provided during registration or support requested.</li>
        <li><strong>Usage Data:</strong> Information about how you interact with our platform, such as features accessed and session durations.</li>
        <li><strong>Device Information:</strong> We may collect data such as geolocation, device orientation, and hardware specifications (e.g., when using specific estimation or surveying modules).</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the data we collect for the following purposes:</p>
      <ul>
        <li>To provide, operate, and maintain our software tools.</li>
        <li>To improve user experience, such as personalizing content or optimizing device-specific APIs like the HTML5 DeviceOrientation API.</li>
        <li>To process transactions and send related information including purchase confirmations and invoices.</li>
        <li>To communicate with you regarding updates, security alerts, and support matters.</li>
      </ul>

      <h2>3. Data Sharing and Disclosure</h2>
      <p>
        We do not sell your personal data. We may share information with trusted third-party service providers (such as hosting partners or analytics providers) solely for the purpose of operating our business, provided they agree to keep this information confidential.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement commercially reasonable security measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, no transmission over the internet or electronic storage is completely secure.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        Depending on your location, you may have rights regarding your personal data, including the right to access, correct, delete, or restrict the processing of your information. Please contact us to exercise these rights.
      </p>

      <h2>6. Changes to Our Privacy Policy</h2>
      <p>
        We may update our privacy policy from time to time. If we make material changes, we will notify you by email or through a notice on our platform prior to the change becoming effective.
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p>
        Welcome to Civil Estimation Pro. By accessing or using our platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
      </p>

      <h2>1. License to Use</h2>
      <p>
        We grant you a limited, non-exclusive, non-transferable, and revocable license to use our web-based software platform for your personal or internal business purposes, strictly in accordance with these Terms.
      </p>

      <h2>2. User Accounts</h2>
      <p>
        When you create an account, you must provide accurate and complete information. You are entirely responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to use the platform to:</p>
      <ul>
        <li>Violate any local, state, national, or international laws or regulations.</li>
        <li>Infringe upon the intellectual property rights of others.</li>
        <li>Transmit any malicious code, viruses, or disabling devices.</li>
        <li>Attempt to bypass or break any security mechanism on any of our tools.</li>
      </ul>

      <h2>4. Engineering Calculations Disclaimer</h2>
      <p>
        Our tools, calculators, and takeoff features are designed to assist estimating professionals. However, <strong>results generated by our software are estimates and should not be relied upon as absolute final engineering determinations.</strong> You are solely responsible for verifying all outputs, dimensions, ratios, and quantities against official project documentation, building codes, and safety standards.
      </p>

      <h2>5. Termination</h2>
      <p>
        We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        In no event shall Civil Estimation Pro, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
      </p>
    </>
  );
}

function CookiesContent() {
  return (
    <>
      <p>
        This Cookie Policy explains how Civil Estimation Pro uses cookies and similar technologies to recognize you when you visit our web platform. It explains what these technologies are and why we use them.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
      </p>

      <h2>2. Why We Use Cookies</h2>
      <p>We use first-party and third-party cookies for several reasons:</p>
      <ul>
        <li><strong>Strictly Necessary Cookies:</strong> These cookies are essential to provide you with services available through our platform and to use some of its features, such as accessing secure areas.</li>
        <li><strong>Performance and Functionality Cookies:</strong> Used to enhance the performance and functionality of our platform but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.</li>
        <li><strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our platform is being used or how effective our marketing campaigns are, or to help us customize our application for you.</li>
      </ul>

      <h2>3. Third-Party Technologies</h2>
      <p>
        In addition to standard cookies, we may use other tracking technologies like web beacons or pixel tags. These technologies help us recognize users, understand engagement with our features, and monitor overall application performance.
      </p>

      <h2>4. Managing Your Cookie Preferences</h2>
      <p>
        You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager or by modifying your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, but your access to some functionality and areas of our platform may be restricted.
      </p>

      <h2>5. Updates to this Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
      </p>
    </>
  );
}
