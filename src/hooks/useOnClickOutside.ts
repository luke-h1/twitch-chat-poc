import { useEffect, type RefObject } from "react";

type Event = WindowEventMap["mousedown"] | WindowEventMap["touchstart"];
type Handler = (event: Event) => void;

const useOnClickOutside = <TElement extends HTMLElement = HTMLElement>(
  ref: RefObject<TElement>,
  handler: Handler
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export default useOnClickOutside;
