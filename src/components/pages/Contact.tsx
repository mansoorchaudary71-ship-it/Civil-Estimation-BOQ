import { Button } from '../ui/Button';
import React, { useState } from 'react';
import { Mail, MessageSquare, PhoneCall, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';


export default function Contact() {
  const { workspaceToken, signInWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!workspaceToken) {
      try {
        await signInWithGoogle();
      } catch (err) {
        return; // sign in failed or cancelled
      }
    }

    const confirmed = window.confirm("Are you sure you want to send this message via your Gmail account?");
    if (!confirmed) return;

    setStatus('loading');

    try {
      // Use the workspaceToken from AuthContext to send the email via Gmail API
      const token = workspaceToken; // Note: In a real app, you might need to ensure the token is still valid
      
      const emailContent = [
        `To: sales@civilpro.com`,
        `Subject: General Inquiry via Contact Form`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        `From: ${formData.firstName} ${formData.lastName} <${formData.email}>`,
        `Message:`,
        `${formData.message}`
      ].join('\r\n');

      const encodedMessage = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        const errorData = await response.json();
        setStatus('error');
        setErrorMessage(errorData.error?.message || 'Failed to send message via Gmail.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setErrorMessage('Network error occurred. Please try again later.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-xl font-semibold text-txt-primary dark:text-white tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-txt-tertiary dark:text-slate-400 max-w-2xl mx-auto">
          Have questions about our tools, pricing, or need technical support? Our team is ready to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-card rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-blue-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-1">Chat to Sales</h3>
               <p className="text-sm text-txt-secondary dark:text-slate-300 mb-3">Speak to our friendly team.</p>
               <a href="mailto:sales@civilpro.com" className="text-base font-medium text-indigo-600 dark:text-blue-400 hover:underline">sales@civilpro.com</a>
             </div>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-1">Visit Us</h3>
               <p className="text-sm text-txt-secondary dark:text-slate-300 mb-3">Visit our office HQ.</p>
               <address className="text-base font-medium dark:text-slate-300 not-italic">
                 100 Civil Way<br/>San Francisco, CA 94107
               </address>
             </div>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <PhoneCall className="w-6 h-6 text-purple-600 dark:text-purple-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-txt-primary dark:text-white mb-1">Call Us</h3>
               <p className="text-sm text-txt-secondary dark:text-slate-300 mb-3">Mon-Fri from 8am to 5pm.</p>
               <a href="tel:+15550000000" className="text-base font-medium text-indigo-600 dark:text-blue-400 hover:underline">+1 (555) 000-0000</a>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-bg-card rounded-[2.5rem] p-8 md:p-10 border border-ui-borderSubtle dark:border-slate-700 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 flex items-center gap-3 overflow-hidden">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="font-semibold text-sm">Your message has been sent successfully!</p>
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-center gap-3 overflow-hidden">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="font-semibold text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col">
                <label htmlFor="contact-first-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                <input id="contact-first-name" 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={status === 'loading'}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden text-txt-primary" 
                  placeholder="e.g. Jane" 
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label htmlFor="contact-last-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                <input id="contact-last-name" 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={status === 'loading'}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden text-txt-primary" 
                  placeholder="e.g. Smith" 
                />
              </div>
            </div>
            
            <div className="space-y-2 flex flex-col">
              <label htmlFor="contact-email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Work Email Address <span className="text-rose-500" aria-hidden="true">*</span></label>
              <input id="contact-email" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden text-txt-primary" 
                placeholder="jane@company.com" 
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label htmlFor="contact-message" className="text-sm font-bold text-slate-700 dark:text-slate-300">How can we help? <span className="text-rose-500" aria-hidden="true">*</span></label>
              <textarea id="contact-message"
                name="message"
                rows={5} 
                value={formData.message}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium resize-none disabled:opacity-50 overflow-hidden text-txt-primary" 
                placeholder="Tell us about your project, team size, or specific features you need..." 
              />
            </div>
            <div className="flex items-start gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Your data is secure and will only be used to respond to your inquiry. Read our <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={status === 'loading'}
              loadingText="Sending via Gmail..."
              className="mt-4"
            >
              {workspaceToken ? 'Send Message via Gmail' : 'Sign in with Google to Send'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
