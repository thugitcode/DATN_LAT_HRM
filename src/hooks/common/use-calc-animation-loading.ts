import { useEffect, useReducer, useRef } from "react";

const ANIMATION_DURATION = 2000;

type AnimationState = {
  isAnimating: boolean;
  startTime: number | null;
};

type AnimationAction = { type: "START" } | { type: "STOP" };

const animationReducer = (state: AnimationState, action: AnimationAction): AnimationState => {
  switch (action.type) {
    case "START":
      return { isAnimating: true, startTime: Date.now() };
    case "STOP":
      return { isAnimating: false, startTime: null };
    default:
      return state;
  }
};

export const useCalcAnimationLoading = (loading?: boolean) => {
  const [{ isAnimating, startTime }, dispatch] = useReducer(animationReducer, {
    isAnimating: false,
    startTime: null,
  });
  const hasClickedRef = useRef(false);
  const prevLoadingRef = useRef(false);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading && !prevLoadingRef.current && hasClickedRef.current) {
      dispatch({ type: "START" });
    }

    if (!loading && prevLoadingRef.current && isAnimating && startTime) {
      const elapsed = Date.now() - startTime;
      const currentCycle = elapsed % ANIMATION_DURATION;
      const timeToCompleteCycle = ANIMATION_DURATION - currentCycle;

      stopTimerRef.current = window.setTimeout(() => {
        dispatch({ type: "STOP" });
        hasClickedRef.current = false;
      }, timeToCompleteCycle);
    }

    prevLoadingRef.current = !!loading;

    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    };
  }, [loading, isAnimating, startTime]);

  return {
    shouldLoading: isAnimating || loading,
    className: isAnimating && "animate-spin",
    style: {
      "--animation-duration": `${ANIMATION_DURATION}ms`,
    },
    onClick: () => {
      hasClickedRef.current = true;
    },
  };
};
