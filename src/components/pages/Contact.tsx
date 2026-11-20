import { Button } from '../ui/Button';
import React, { useState } from 'react';
import { Mail, MessageSquare, PhoneCall, MapPin, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { SEO } from '../SEO';
import { CONTACT_EMAIL } from '../../seo/siteConfig';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('idle');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all fields.');
      setStatus('error');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    // There is no backend mailbox on this static site, so the message is
    // sent through the visitor's own email app. Nothing is sent from this
    // page itself: the mailto link below opens the visitor's email client
    // with the message prefilled, and the visitor presses Send there.
    const subject = 'General Inquiry via Contact Form';
    const body = [
      `From: ${formData.firstName} ${formData.lastName} <${formData.email}>`,
      '',
      'Message:',
      formData.message,
    ].join('\n');
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setStatus('success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO
        title="Contact Us"
        description="Contact Civil Estimation Pro for help with BOQ calculators, material rates, pricing, or technical support. Send us a message and we will get back to you."
      />
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-xl font-semibold text-txt-primary dark:text-white tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-txt-tertiary dark:text-txt-tertiary max-w-2xl mx-auto">
          Have questions about our tools, pricing, or need technical support? Our team is ready to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-card rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm flex items-start gap-4 hover:shadow-brand-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-accent-50 dark:bg-accent-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <MessageSquare className="w-6 h-6 text-accent-800 dark:text-accent-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-1">Chat to Sales</h3>
               <p className="text-sm text-txt-secondary dark:text-txt-tertiary mb-3">Speak to our friendly team.</p>
               <a href={`mailto:${CONTACT_EMAIL}`} className="text-base font-medium text-accent-800 dark:text-accent-400 hover:underline">{CONTACT_EMAIL}</a>
             </div>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm flex items-start gap-4 hover:shadow-brand-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-accent-50 dark:bg-accent-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <MapPin className="w-6 h-6 text-accent-800 dark:text-accent-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-1">Visit Us</h3>
               <p className="text-sm text-txt-secondary dark:text-txt-tertiary mb-3">Visit our office HQ.</p>
               <address className="text-base font-medium dark:text-txt-tertiary not-italic">
                 100 Civil Way<br/>San Francisco, CA 94107
               </address>
             </div>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm flex items-start gap-4 hover:shadow-brand-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-accent-50 dark:bg-accent-500/20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <PhoneCall className="w-6 h-6 text-accent-700 dark:text-accent-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-1">Call Us</h3>
               <p className="text-sm text-txt-secondary dark:text-txt-tertiary mb-3">Mon-Fri from 8am to 5pm.</p>
               <a href="tel:+15550000000" className="text-base font-medium text-accent-800 dark:text-accent-400 hover:underline">+1 (555) 000-0000</a>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-bg-card rounded-[2.5rem] p-8 md:p-10 border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status === 'success' && (
              <div className="bg-ui-success border border-ui-successBorder text-ui-successText rounded-2xl p-4 flex items-start gap-3 overflow-hidden">
                <CheckCircle className="w-5 h-5 text-ui-successText shrink-0 mt-0.5" />
                <p className="font-semibold text-sm">Your email app should now open with your message ready to send. Press Send in your email app to deliver it to {CONTACT_EMAIL} — or email us directly at <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.</p>
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div className="bg-ui-error border border-ui-errorBorder text-ui-errorText rounded-2xl p-4 flex items-center gap-3 overflow-hidden">
                <AlertCircle className="w-5 h-5 text-ui-errorText shrink-0" />
                <p className="font-semibold text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col">
                <label htmlFor="contact-first-name" className="text-sm font-bold text-txt-primary">First Name <span className="text-ui-errorText" aria-hidden="true">*</span></label>
                <input id="contact-first-name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-accent-800 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium overflow-hidden text-txt-primary"
                  placeholder="e.g. Jane"
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label htmlFor="contact-last-name" className="text-sm font-bold text-txt-primary">Last Name <span className="text-ui-errorText" aria-hidden="true">*</span></label>
                <input id="contact-last-name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-accent-800 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium overflow-hidden text-txt-primary"
                  placeholder="e.g. Smith"
                />
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <label htmlFor="contact-email" className="text-sm font-bold text-txt-primary">Work Email Address <span className="text-ui-errorText" aria-hidden="true">*</span></label>
              <input id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-accent-800 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium overflow-hidden text-txt-primary"
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label htmlFor="contact-message" className="text-sm font-bold text-txt-primary">How can we help? <span className="text-ui-errorText" aria-hidden="true">*</span></label>
              <textarea id="contact-message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-accent-800 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium resize-none overflow-hidden text-txt-primary"
                placeholder="Tell us about your project, team size, or specific features you need..."
              />
            </div>
            <div className="flex items-start gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-ui-successText shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-txt-secondary">
                Your message opens in your own email app — we never see it until you press Send there. Read our <a href="/privacy" className="text-accent-800 hover:underline">Privacy Policy</a>.
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              className="mt-4"
            >
              <Mail className="w-5 h-5 mr-2" />
              Open Email App to Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
