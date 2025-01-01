/* eslint-disable react-hooks/exhaustive-deps */
import { SuggestionsState } from "@frontend/components/Chat/ChatInput";
import { useCallback } from "react";
import { useSetState } from "react-use";

export const suggestionsInitialState: SuggestionsState = {
  type: "users",
  isActive: false,
  items: [],
  activeIndex: 0,
  start: 0,
  end: 0,
};

export const setSuggestionsUp = (
  state: SuggestionsState
): SuggestionsState => ({
  ...state,
  activeIndex:
    state.activeIndex === 0 ? state.items.length - 1 : state.activeIndex - 1,
});

export const setSuggestionsDown = (
  state: SuggestionsState
): SuggestionsState => ({
  ...state,
  activeIndex:
    state.activeIndex === state.items.length - 1 ? 0 : state.activeIndex + 1,
});

export default function useSuggestions() {
  const [state, setState] = useSetState<SuggestionsState>(
    suggestionsInitialState
  );

  const reset = useCallback(() => setState(suggestionsInitialState), []);
  const hide = useCallback(() => setState({ isActive: false }), []);
  const up = useCallback(() => setState(setSuggestionsUp), []);
  const down = useCallback(() => setState(setSuggestionsDown), []);
  return {
    state,
    set: setState,
    reset,
    hide,
    up,
    down,
  };
}
