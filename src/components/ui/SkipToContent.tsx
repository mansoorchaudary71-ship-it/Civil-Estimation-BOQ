import React from 'react';

/**
 * Skip link. The app uses HashRouter, so a plain `href="#main-content"` rewrote the URL hash to
 * "#main-content" and made the router think the user navigated to an unknown page.
 * We move focus programmatically instead and keep the hash untouched.
 */
export default function SkipToContent() {
  const skip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start' });
    }
  };
  return (
    <a
      href="#main-content"
      onClick={skip}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-xl font-semibold"
    >
      Skip to main content
    </a>
  );
}
