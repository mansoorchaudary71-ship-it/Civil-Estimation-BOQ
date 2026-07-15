# Unified UI Design System Plan for Estimation Platform

## The Problem
Your 25+ calculators look disjointed. Varying component shapes, scattered input spacing, broken horizontal text on mobile result cards, and radio buttons posing as sub-navigation hurt the overall perceived reliability and enterprise layout.

## The Objective
Implement a core **Design System** that standardizes input groups (widths & padding), robust output cards (wrapping data cleanly), and unified tool-tab navigation to ensure a sub-2 click hierarchy.

---

## 1. Standardized Inputs: \`MetricInput.tsx\`
**Goal:** Consistent padding, encapsulated error validation, fixed trailing units, uniform mobile/desktop scaling.

**How it works:**
* Unified `px-4 py-3` padding.
* Absolute positioned right units (`cm`, `kg`, `m³`) that never obstruct input.
* Standardized `text-slate-500 tracking-wider text-xs` uppercase labeling.

**Implementation Example:**
```tsx
import { MetricInput } from '../ui/MetricInput';

<MetricInput 
  label="Lane Width" 
  unit="m" 
  value={laneWidth}
  onChange={e => setLaneWidth(e.target.value)}
  type="number"
/>
```

---

## 2. Bulletproof Output Grid: \`ResultCard.tsx\`
**Goal:** Handle enormous metric strings (`1200923.44`, labels like "Net Operative Area") without layout breaking, flex spilling, or squeezing content on mobile.

**How it works:**
* Utilizes `min-w-0` and `overflow-hidden` at the root object to enforce width limits.
* Utilizes `break-all` paired with `sm:flex-nowrap` layout behavior for dynamic font sizing depending on output density.
* Includes variant color theming mapping (primary/success/warning) aligned uniformly across all models.

**Implementation Example:**
```tsx
import { ResultCard } from '../ui/ResultCard';

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <ResultCard 
    title="Net Operative Area" 
    value={1455.50} 
    unit="m²" 
    variant="primary" 
    description="Total plaster area minus openings"
  />
</div>
```

---

## 3. Sub-Routing & Navigation: \`SubNavigation.tsx\`
**Goal:** Replace chaotic vertical scrolling radio buttons and easily broken snap horizontal tool tabs within calculators. Create a "Pill container" behavior.

**How it works:**
* Replaces standard `<ul>` horizontal layout overflows and manual `snap-x` configs with an automated `flex-wrap` container that stacks harmoniously on narrower screen segments but stays rigidly horizontal on wide views.
* Replaces standalone radio buttons used to toggle states (e.g. Metric vs Imperial inside tools or Wall Types).

**Implementation Example:**
```tsx
import { SubNavigation } from '../ui/SubNavigation';
import { Layers, Square } from 'lucide-react';

const options = [
  { id: '1-brick', label: '1 Brick Wall', icon: <Layers className="w-4 h-4"/> },
  { id: 'half-brick', label: 'Half Brick', icon: <Square className="w-4 h-4"/> }
];

<SubNavigation 
  options={options} 
  activeId={wallType} 
  onChange={(id) => setWallType(id)} 
/>
```

---

## Next Steps for Migration
1. Start replacing `input` blocks globally inside `<section className="lg:col-span-8">` content modules using RegEx find/replace over your calculator array.
2. Search and replace your custom gray/blue hardcoded result containers mapping over to `<ResultCard />` array rendering.
3. Migrate radio tool toggles over to `<SubNavigation />`.
