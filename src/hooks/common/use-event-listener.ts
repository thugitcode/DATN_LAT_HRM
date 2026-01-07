import { useEffect, useRef } from "react";

export const useEventListener = (
  eventName: string,
  handler: (event: MessageEvent) => void,
  element = window,
  condition = true,
  delay = 100
) => {
  const handlerStoreRef = useRef<((event: Event) => void) | null>(null);

  useEffect(() => {
    handlerStoreRef.current = handler as (event: Event) => void;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;

    if (!isSupported) return;

    const eventListener = (event: Event) => handlerStoreRef.current?.(event);

    if (condition) {
      setTimeout(() => {
        element.addEventListener(eventName, eventListener);
      }, delay);
    } else {
      element.removeEventListener(eventName, eventListener);
    }

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, condition, delay]);
};
