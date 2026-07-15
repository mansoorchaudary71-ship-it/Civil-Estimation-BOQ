import { useState, useCallback } from 'react';

export function useEstimateProcessing(delayMs = 500) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Simulates processing time before computing the final estimate
  const processEstimate = useCallback(async (computeCallback: () => void) => {
    setIsProcessing(true);
    
    // Simulate network/computation delay for premium feel
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    computeCallback();
    setHasData(true);
    setIsProcessing(false);
  }, [delayMs]);

  // Resets the state back to the 'Empty State' placeholder
  const resetEstimate = useCallback(() => {
    setHasData(false);
    setIsProcessing(false);
  }, []);

  return { isProcessing, hasData, processEstimate, resetEstimate };
}
