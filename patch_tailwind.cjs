const fs = require('fs');

const tailwindPath = 'tailwind.config.js';
let config = fs.readFileSync(tailwindPath, 'utf8');

// We want to add the fontSize scale to theme.extend or theme directly
// If theme.extend.fontSize doesn't exist, we add it.

const fontSizeScale = `
      fontSize: {
        'xs': ['var(--text-caption-size)', { lineHeight: 'var(--text-caption-lh)', letterSpacing: 'var(--text-caption-ls)' }],
        'sm': ['var(--text-body-sm-size)', { lineHeight: 'var(--text-body-sm-lh)', letterSpacing: 'var(--text-body-sm-ls)' }],
        'base': ['var(--text-body-size)', { lineHeight: 'var(--text-body-lh)', letterSpacing: 'var(--text-body-ls)' }],
        'lg': ['var(--text-body-lg-size)', { lineHeight: 'var(--text-body-lg-lh)', letterSpacing: 'var(--text-body-lg-ls)' }],
        'xl': ['var(--text-h6-size)', { lineHeight: 'var(--text-h6-lh)', letterSpacing: 'var(--text-h6-ls)' }],
        '2xl': ['var(--text-h5-size)', { lineHeight: 'var(--text-h5-lh)', letterSpacing: 'var(--text-h5-ls)' }],
        '3xl': ['var(--text-h4-size)', { lineHeight: 'var(--text-h4-lh)', letterSpacing: 'var(--text-h4-ls)' }],
        '4xl': ['var(--text-h3-size)', { lineHeight: 'var(--text-h3-lh)', letterSpacing: 'var(--text-h3-ls)' }],
        '5xl': ['var(--text-h2-size)', { lineHeight: 'var(--text-h2-lh)', letterSpacing: 'var(--text-h2-ls)' }],
        '6xl': ['var(--text-h1-size)', { lineHeight: 'var(--text-h1-lh)', letterSpacing: 'var(--text-h1-ls)' }],
        '7xl': ['var(--text-display-lg-size)', { lineHeight: 'var(--text-display-lg-lh)', letterSpacing: 'var(--text-display-lg-ls)' }],
        '8xl': ['var(--text-display-xl-size)', { lineHeight: 'var(--text-display-xl-lh)', letterSpacing: 'var(--text-display-xl-ls)' }],
        '9xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
`;

if (config.includes('fontSize:')) {
    console.log("fontSize already exists in tailwind config.");
} else {
    config = config.replace('extend: {', 'extend: {' + fontSizeScale);
    fs.writeFileSync(tailwindPath, config, 'utf8');
    console.log("fontSize scale added successfully to tailwind config.");
}

