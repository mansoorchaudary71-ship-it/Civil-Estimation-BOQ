# Integrating Empty States and Processing Animations

To implement the premium Dashboard state transitioning in your modules, follow these implementation steps using the newly created unified components.

## 1. Import the New Tools
Import the Empty State, Skeleton, and Custom Hook into your calculator module:

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { ProcessingSkeleton } from '@/components/ui/ProcessingSkeleton';
import { useEstimateProcessing } from '@/hooks/useEstimateProcessing';
```

## 2. Initialize the Hook
At the top of your component, initialize the state manager:

```tsx
const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing(500); // 500ms delay
```

## 3. Wrap Your Calculation Logic
Wrap your calculation function (usually `handleCalculate` or similar) inside `processEstimate`:

```tsx
const handleCalculate = () => {
  // Pass your existing synchronous state update logic as a callback!
  processEstimate(() => {
     setFinalVolume(calculatedVolume);
     // ... set other results
  });
};
```

*Note:* If your inputs change, you might want to call `resetEstimate()` to drop back to the Empty State until they evaluate again!

## 4. Render the UI Conditionally
Replace your hardcoded result grid with this tertiary condition wrapper:

```tsx
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">Estimates</h2>
  
  {isProcessing ? (
    // State 1: The user clicked calculate, animate processing
    <ProcessingSkeleton count={4} />
    
  ) : !hasData ? (
    // State 2: No calculations have been run yet
    <EmptyState 
      title="Ready for Calculation" 
      message="Fill out all dimensions and click Calculate to generate your material estimate." 
    />
    
  ) : (
    // State 3: Final Data Display
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
      <ResultCard title="Total Volume" value={finalVolume} unit="m³" variant="primary" />
      {/* ... render remaining cards */}
    </div>
  )}
</div>
```

With these 4 steps, you'll immediately eliminate the "0.00" placeholders and provide smooth loading feedback that feels high-quality and intent-driven.
