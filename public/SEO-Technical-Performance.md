# Civil Estimation Pro - Technical SEO & Web Performance Optimization

To achieve LCP < 2.5s, CLS < 0.1, INP < 200ms, and a PageSpeed Insights score > 90 on mobile, implement the following production-ready optimizations.

---

## 1. HTML HEAD OPTIMIZATION

This highly optimized `<head>` prioritizes critical rendering paths, establishes early connections, and defers non-essential assets.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <!-- Essential Viewport for Responsive Mobile Design -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    
    <title>RCC Slab Calculator | Concrete & Steel Estimation</title>
    <meta name="description" content="Calculate concrete volume, dry materials, and steel Bar Bending Schedule (BBS) for one-way and two-way RCC slabs.">

    <!-- Theme Colors for Mobile Browsers -->
    <meta name="theme-color" content="#1a56db">

    <!-- Preconnect to critical third-party domains (e.g., Google Analytics, Fonts) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Preload critical assets: Hero image and main font -->
    <link rel="preload" href="/images/hero-slab-calculator.webp" as="image">
    <link rel="preload" href="/fonts/inter-v12-latin-regular.woff2" as="font" type="font/woff2" crossorigin>

    <!-- Favicon & Apple Touch Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <!-- CRITICAL CSS: Inlined directly to render above-the-fold content immediately -->
    <style>
        /* Inline structural CSS for header, hero, and main layout */
        body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
        .header { padding: 1rem; background: #1a56db; color: white; }
        .hero { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; }
        /* Result container pre-sized to prevent CLS */
        #calculator-results { min-height: 400px; }
    </style>

    <!-- Asynchronous loading of primary stylesheet -->
    <link rel="stylesheet" href="/css/main.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
</head>
```

---

## 2. IMAGE OPTIMIZATION

### Shell Script to Batch Convert PNG/JPG to WebP
Run this script in your terminal (requires `cwebp` package: `sudo apt install webp` or `brew install webp`).

```bash
#!/bin/bash
# Convert all JPG and PNG to WebP with 80% quality (best balance of size/quality)
find ./public/images -type f \( -iname \*.jpg -o -iname \*.jpeg -o -iname \*.png \) -exec sh -c '
  for img do
    # Skip if webp already exists
    webp_img="${img%.*}.webp"
    if [ ! -f "$webp_img" ]; then
      echo "Converting $img to WebP..."
      cwebp -q 80 "$img" -o "$webp_img"
    fi
  done
' sh {} +
echo "Image optimization complete."
```

### HTML Template for Responsive & Lazy Loaded Images
```html
<!-- Example: Below-the-fold calculator screenshot -->
<picture>
    <!-- Serve AVIF if browser supports it, fallback to WebP, then JPEG -->
    <source srcset="/images/slab-diagram-small.webp 400w, /images/slab-diagram-large.webp 800w" type="image/webp" sizes="(max-width: 600px) 400px, 800px">
    
    <!-- Native lazy loading, explicit width/height to prevent CLS -->
    <img src="/images/slab-diagram-large.jpg" 
         alt="Cross section diagram of a two-way RCC slab" 
         width="800" 
         height="600" 
         loading="lazy" 
         decoding="async"
         style="content-visibility: auto;">
</picture>
```

*(For SVGs: Minify them using SVGO, remove width/height attributes, and use `viewBox` for responsive scaling).*

---

## 3. JAVASCRIPT OPTIMIZATION

### Intersection Observer (Lazy Loading Tool Logic) & Debouncing INP
This ensures the calculator logic is only parsed when the user scrolls to it, and rapid typing doesn't freeze the main thread (improving INP).

```javascript
// 1. Debounce Function: Prevents excessive calculations while user types
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Heavy calculation function
const performSlabCalculation = () => {
    // Break up long tasks to avoid INP spikes
    setTimeout(() => {
        const length = parseFloat(document.getElementById('length').value);
        const width = parseFloat(document.getElementById('width').value);
        const depth = parseFloat(document.getElementById('depth').value);
        
        if (!length || !width || !depth) return;

        // Perform calculation...
        const volume = length * width * depth;
        document.getElementById('result-volume').innerText = volume.toFixed(2) + " m³";
        
        // Remove skeleton loader class
        document.getElementById('calculator-results').classList.remove('loading');
    }, 0); // Yield to main thread
};

// Apply debounce (300ms) to inputs
const debouncedCalculate = debounce(performSlabCalculation, 300);
document.querySelectorAll('.calc-input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('calculator-results').classList.add('loading');
        debouncedCalculate();
    });
});

// 2. Intersection Observer: Only load heavy charting/BBS JS when in view
document.addEventListener("DOMContentLoaded", function() {
    const calcSection = document.getElementById('calculator-module');
    
    if ('IntersectionObserver' in window) {
        const scriptObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Inject heavy script (e.g., PDF generation or charting)
                    const externalScript = document.createElement('script');
                    externalScript.src = '/js/heavy-bbs-generator.js';
                    externalScript.defer = true;
                    document.body.appendChild(externalScript);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px 0px' }); // Load strictly 200px before it enters view
        
        scriptObserver.observe(calcSection);
    }
});
```

---

## 4. CSS OPTIMIZATION

**CSS Containment & Will-Change**
Wrap your calculator in a specific DOM element and use CSS containment. This tells the browser that changes inside the calculator will not affect the layout of the rest of the page, drastically speeding up recalculation paints.

```css
/* Calculator wrapper style */
.calculator-container {
    /* Isolate layout and style calculations */
    contain: layout style paint;
    
    /* Pre-allocate space to prevent CLS when results render */
    min-height: 600px;
}

.result-card {
    /* Tell browser to hardware-accelerate this element if it animates */
    will-change: transform, opacity;
    transition: opacity 0.3s ease;
}

.font-loaded body {
    /* Ensure no invisible text while custom fonts load */
    font-family: 'Inter', sans-serif;
}
```

---

## 5. CACHING STRATEGY (Service Worker)

Create a `sw.js` file at your root directory. This provides offline capabilities and lightning-fast load times for returning visitors.

```javascript
const CACHE_NAME = 'civil-est-pro-v1.3';
const STATIC_ASSETS = [
  '/',
  '/css/main.css',
  '/js/main.js',
  '/images/hero-slab-calculator.webp',
  '/fonts/inter-v12-latin-regular.woff2',
  '/offline.html'
];

// Install event: Cache critical static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch event: Network-First for HTML, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Cache-First strategy for images, CSS, JS
  if (requestUrl.pathname.match(/\.(png|jpg|webp|css|js|woff2)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Network-First strategy for HTML calculator pages
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Offline fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
```
*(Register the SW in your main app JS: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`)*

---

## 6. CLOUDFLARE CONFIGURATION

If routing GitHub pages through Cloudflare, configure these settings in your Cloudflare dashboard:

1. **Speed -> Optimization**:
   - Auto Minify: Check **JavaScript**, **CSS**, and **HTML**.
   - Enable **Brotli** compression (significantly better than GZIP).
   - Enable **Early Hints** (pushes preloads to the browser before HTML finishes generating).

2. **Caching -> Page Rules**:
   - **Rule 1: Static Assets**
     - URL: `*civilestimationpro.com/*.jpg`, `*.css`, `*.js`, `*.woff2`, `*.webp`
     - Setting: `Browser Cache TTL: a year`, `Cache Level: Cache Everything`, `Edge Cache TTL: a month`
   - **Rule 2: HTML Pages (Calculators)**
     - URL: `*civilestimationpro.com/*-calculator/`
     - Setting: `Browser Cache TTL: 4 hours`, `Cache Level: Standard`

3. **Security -> Rules -> Transform Rules (Headers)**:
   Add these response headers to boost security without breaking calculator JS:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `X-Content-Type-Options: nosniff`
   - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;`

---

## 7. CORE WEB VITALS FIXES (Checklist)

*   **CLS (Cumulative Layout Shift):**
    *   **Font Flash:** Use `font-display: swap;` in your `@font-face` CSS declarations.
    *   **Image Dimensions:** Always include explicit `width="X"` and `height="Y"` on `<img>` tags.
    *   **Result Box Sizing:** Apply `min-height: 450px;` to the `<div id="calculator-results">`. Without this, the page layout violently drops down the moment the user clicks "Calculate" and the results suddenly render.
*   **LCP (Largest Contentful Paint):**
    *   Preload the main H1 or Hero Image using the `<link rel="preload">` mapped in Section 1.
    *   Host fonts locally. Do not rely entirely on Google Fonts network handshakes.
*   **INP (Interaction to Next Paint):**
    *   The `debounce()` function limits calculations to occurring strictly *after* the user pauses typing.
    *   Wrapping heavy calculation loops (like generating thousands of rows for an exhaustive BOQ Excel generation) in `setTimeout(()=>{}, 0)` releases the main thread, allowing the browser to visually paint a "Loading..." spinner instantly.

---

## 8. STRUCTURED PERFORMANCE MONITORING

To truly monitor CWV, you must capture field data from real engineers using the site. Use the official `web-vitals` script and pipe it to Google Analytics.

```html<!-- Add this just before closing </body> tag -->
<script type="module">
  import {onCLS, onINP, onLCP, onFCP, onTTFB} from 'https://unpkg.com/web-vitals@3?module';

  function sendToGoogleAnalytics({name, delta, value, id}) {
    // Assumes gtag.js is loaded and configured for GA4
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        // Milliseconds for INP/LCP, 1000x for fractional CLS
        value: Math.round(name === 'CLS' ? delta * 1000 : delta), 
        event_label: id,   // id unique to current page load
        non_interaction: true,
      });
    }
  }

  // Measure and send CWV metrics
  onCLS(sendToGoogleAnalytics);
  onINP(sendToGoogleAnalytics);
  onLCP(sendToGoogleAnalytics);
  onFCP(sendToGoogleAnalytics);
  onTTFB(sendToGoogleAnalytics);
</script>
```
