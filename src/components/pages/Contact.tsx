import React, { useState } from 'react';
import { Mail, MessageSquare, PhoneCall, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
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

    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: 'General Inquiry via Contact Form',
          message: formData.message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message.');
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
        <h1 className="text-2xl md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Have questions about our tools, pricing, or need technical support? Our team is ready to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-blue-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Chat to Sales</h3>
               <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Speak to our friendly team.</p>
               <a href="mailto:sales@civilpro.com" className="text-base font-medium text-indigo-600 dark:text-blue-400 hover:underline">sales@civilpro.com</a>
             </div>
          </div>

          <div className="bg-bg-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Visit Us</h3>
               <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Visit our office HQ.</p>
               <address className="text-base font-medium dark:text-slate-300 not-italic">
                 100 Civil Way<br/>San Francisco, CA 94107
               </address>
             </div>
          </div>

          <div className="bg-bg-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow overflow-hidden">
             <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
               <PhoneCall className="w-6 h-6 text-purple-600 dark:text-purple-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Call Us</h3>
               <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Mon-Fri from 8am to 5pm.</p>
               <a href="tel:+15550000000" className="text-base font-medium text-indigo-600 dark:text-blue-400 hover:underline">+1 (555) 000-0000</a>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-bg-card rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm">
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
              <div className="space-y-2">
                <label className="text-base font-medium dark:text-slate-300">First Name</label>
                <><label htmlFor="a11y-input-573" className="sr-only">Jane</label>
<input id="a11y-input-573" 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden" 
                  placeholder="Jane" 
                /></>
              </div>
              <div className="space-y-2">
                <label className="text-base font-medium dark:text-slate-300">Last Name</label>
                <><label htmlFor="a11y-input-574" className="sr-only">Smith</label>
<input id="a11y-input-574" 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden" 
                  placeholder="Smith" 
                /></>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-base font-medium dark:text-slate-300">Email Address</label>
              <><label htmlFor="a11y-input-575" className="sr-only">jane@example.com</label>
<input id="a11y-input-575" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden" 
                placeholder="jane@example.com" 
              /></>
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium dark:text-slate-300">Message</label>
              <textarea 
                name="message"
                rows={5} 
                value={formData.message}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none disabled:opacity-50 overflow-hidden" 
                placeholder="How can we help?" 
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r   hover:from-blue-700 hover: disabled:opacity-75 text-white font-bold rounded-2xl shadow-[0_4px_24px_rgba(37,99,235,0.25)] transition-all overflow-hidden"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
