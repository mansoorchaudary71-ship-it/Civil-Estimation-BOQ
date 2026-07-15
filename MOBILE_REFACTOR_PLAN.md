# Mobile-First Refactor Plan

This document outlines the specific CSS rules and Tailwind strategies to fully optimize the mobile layout of the web application. By adhering to these patterns, we eliminate layout breaking issues and ensure complete touch-accessibility.

---

## 1. Touch Targets (Min 44x44px)

Apple's Human Interface Guidelines stipulate that any touchable area must be at least 44x44 points. Many default generic inputs and buttons fall short of this height.

**Tailwind Implementation:**
Ensure all inputs, buttons, and clickable icons have a minimum height and width. Use padding instead of fixed heights when possible to allow font-scaling, but enforce a `min-h-[44px]` if necessary. 

**Code Pattern:**
```html
<!-- Buttons -->
<button className="min-h-[44px] min-w-[44px] px-5 py-3 rounded-xl bg-blue-600 text-white font-bold ...">
  Calculate
</button>

<!-- Inputs (py-3 with standard text usually achieves ~48px height) -->
<input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ..." />

<!-- Clickable Icon/Small Button -->
<button className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center ...">
  <Icon className="w-5 h-5" />
</button>
```

---

## 2. Single-Column Mobile Forms

Never force fields side-by-side on mobile. Inputs need 100% of the viewport width minus padding to be easily tappable and readable.

**Tailwind Implementation:**
Use CSS Grid with a baseline of `grid-cols-1` and step up to `sm:grid-cols-2` or `lg:grid-cols-3` at larger breakpoints.

**Code Pattern:**
```html
<!-- Wrapper around the input fields -->
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  
  <div className="w-full">
    <label className="block text-xs font-bold mb-1.5">Length</label>
    <input type="number" className="w-full px-4 py-3 rounded-xl ..." />
  </div>
  
  <div className="w-full">
    <label className="block text-xs font-bold mb-1.5">Width</label>
    <input type="number" className="w-full px-4 py-3 rounded-xl ..." />
  </div>

</div>
```
*(Search your codebase for any `grid-cols-2` without the `sm:` prefix and replace it!)*

---

## 3. Responsive Data-Tables (The "Card Stack" Pattern)

Standard HTML tables `<table className="...">` will break the mobile viewport width. You have two excellent solutions.

### Solution A: The Scrollable Wrapper (Fastest)
Wrap the table in a container with `overflow-x-auto` to allow horizontal scrolling without breaking the whole page layout.

```html
<div className="w-full overflow-x-auto rounded-xl border border-slate-200">
  <table className="min-w-full text-left text-sm whitespace-nowrap">
    {/* Table headers and rows */}
  </table>
</div>
```

### Solution B: The CSS Grid "Mobile Cards" (Best UX)
Use CSS Grid to stack standard table rows into "cards" on mobile, then switch to standard table-row formatting on tablet/desktop.

```html
<!-- Mobile: Vertical Stack, Desktop: Grid columns -->
<div className="grid gap-3">
  {data.map(item => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-xl items-center border">
      <span className="text-xs font-bold sm:hidden">Item:</span>
      <span className="font-semibold">{item.name}</span>
      
      <span className="text-xs font-bold sm:hidden">Qty:</span>
      <span>{item.qty}</span>
      
      <span className="text-xs font-bold sm:hidden">Rate:</span>
      <span>${item.rate}</span>
    </div>
  ))}
</div>
```

---

## 4. Fluid Typography for Financial Output (Clamp)

Hardcoded large text sizes (e.g., `text-4xl` = `36px`) will clip or unexpectedly wrap on mobile screens (e.g., "$1,234,567.89"). Using `clamp()` solves this natively.

`clamp(MIN, PREFERRED, MAX)` allows text to scale smoothly between the minimum and maximum boundaries based on viewport width (`vw`).

**Tailwind Implementation:**
Create a custom utility class in your global CSS, or use Tailwind's arbitrary values.

**Code Pattern (Arbitrary Values):**
```html
<span className="text-[clamp(1.5rem,5vw,2.5rem)] font-black tracking-tight text-slate-900 leading-none">
  $1,234,567.89
</span>
```

**Global CSS Implementation (Better for reusability - Add to index.css):**
```css
@layer utilities {
  .text-fluid-metric {
    /* Minsizes at 1.5rem (24px), scales at 5vw, maxes at 2.5rem (40px) */
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    line-height: 1.1;
  }
}
```

```html
<div className="flex items-baseline gap-2 mt-auto flex-wrap sm:flex-nowrap">
  <span className="text-fluid-metric font-black tracking-tight break-words">
    {value}
  </span>
  <span className="text-sm font-bold opacity-70 flex-shrink-0">
    {unit}
  </span>
</div>
```

### Bonus Rule: Safe Wrapping
For completely unpredictable metric numbers (like `30491024.12323`), always apply `break-all` on mobile and `sm:break-normal` on desktop. If a word gets too long, it will safely wrap onto the next line instead of overflowing out of bounds horizontally.
