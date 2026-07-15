# Deployment & PWA Guide

## 1. Hosting on GitHub Pages
To seamlessly deploy this Application to GitHub pages automatically upon every code push:

1. Push your repository to GitHub.
2. Go to your repository settings -> **Pages**.
3. Under **Source**, select **GitHub Actions** instead of "Deploy from a branch".
4. The `.github/workflows/deploy.yml` file is already included in this repository. It automatically handles `npm install`, `npm run build`, and deploying the `dist/` directory.
5. **Note:** If your app is not hosted at the root of your domain (e.g., `https://username.github.io/repo-name/`), you need to update `vite.config.ts` to include `base: '/repo-name/'`.

## 2. Progressive Web App (PWA) Setup
This app acts as a PWA, allowing installation on mobile tablets and offline use in the field.

### Included Files:
*   **`public/manifest.json`**: Provides standard application metadata like `name`, `theme_color`, and `display: "standalone"` to force the browser to hide the address bar and act as a native app.
*   **`public/sw.js`**: The service worker file that caches the core application, allowing it to load instantly and work offline.
*   **`index.html`**: Has been updated to register `sw.js` and link to `manifest.json`.

### Required Manual Steps:
For the Add-to-Homescreen prompt to function completely, you will need to add icons.
1. Generate a generic icon design.
2. Save it as `public/icon-192x192.png` and `public/icon-512x512.png` sizes to satisfy browser PWA requirements.

## 3. Recommended Scripts
The `package.json` file uses standard Vite scripts. The workflow relies on:
```json
"scripts": {
  "dev": "tsx server.ts",
  "build": "vite build",
  "preview": "vite preview"
}
```
The automated script simply runs `npm run build` using Node environments directly. No other modifications are needed to the scripts.
