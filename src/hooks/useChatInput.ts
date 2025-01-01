import {
  ChangeEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useSuggestions from "./useSuggestions";
import { SendMessageFn } from "@frontend/store/slices/chat/types";
import { useAppSelector } from "@frontend/store/hooks";
import { emotesSelector } from "@frontend/store/selectors/emote";
import {
  meLoginSelector,
  currentChannelNameSelector,
  currentChannelUsersSelector,
  currentChannelRecentInputsSelector,
} from "@frontend/store/slices/chat/selectors";
import { SUGGESTION_TYPES } from "@frontend/store/slices/chat/config";
import getUsersByBeginText from "@frontend/util/getUsersByBeginText";
import getEmotesByText from "@frontend/util/getEmotesByText";
import replaceSuggestionText from "@frontend/util/replaceSuggestionText";

interface UseChatReturn {
  suggestions: ReturnType<typeof useSuggestions>;
  handleEmoteClick: (name: string) => void;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  handleSuggestionMouseEnter: (index: number) => void;
  handleSuggestionClick: (index: number) => void;
}

export default function useChatInput(
  sendMessage: SendMessageFn,
  textAreaRef: RefObject<HTMLTextAreaElement>
): UseChatReturn {
  const [recentInputsIndex, setRecentInputsIndex] = useState<number>(-1);

  const meLogin = useAppSelector(meLoginSelector);
  const channel = useAppSelector(currentChannelNameSelector);
  const emotes = useAppSelector(emotesSelector);
  const users = useAppSelector(currentChannelUsersSelector);
  const recentInputs = useAppSelector(currentChannelRecentInputsSelector);

  const suggestions = useSuggestions();

  useEffect(() => {
    setRecentInputsIndex(-1);
  }, [recentInputs]);

  const getDeps = () => ({
    textarea: textAreaRef.current!,
    meLogin,
    channel,
    emotes,
    users,
    recentInputs,
    recentInputsIndex,
    suggestions,
  });

  const deps = useRef({} as ReturnType<typeof getDeps>);

  deps.current = getDeps();

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target;

    const spaceIndexBefore = value.lastIndexOf(" ", selectionStart - 1);
    const spaceIndexAfter = value.indexOf(" ", selectionStart);

    const start = spaceIndexBefore === -1 ? 0 : spaceIndexBefore + 1;
    const end = spaceIndexAfter === -1 ? value.length : spaceIndexAfter;

    const word = value.substring(start, end);

    const usersMatch = SUGGESTION_TYPES.users.regex.exec(word);

    // search for a user
    if (usersMatch) {
      const [, beginText] = usersMatch;
      const items = getUsersByBeginText(
        beginText,
        deps.current.users,
        deps.current.meLogin!,
        SUGGESTION_TYPES.users.limit
      );

      deps.current.suggestions.set({
        type: "users",
        isActive: true,
        items,
        activeIndex: 0,
        start,
        end,
      });
      return;
    }

    // emotes
    const emotesMatch = SUGGESTION_TYPES.emotes.regex.exec(word);

    if (emotesMatch && deps.current.emotes) {
      const [, text] = emotesMatch;
      const items = getEmotesByText(
        text,
        deps.current.emotes,
        SUGGESTION_TYPES.emotes.limit
      );

      deps.current.suggestions.set({
        type: "emotes",
        isActive: true,
        items,
        activeIndex: 0,
        start,
        end,
      });
      return;
    }

    if (deps.current.suggestions.state.isActive) {
      deps.current.suggestions.reset();
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleKeyUp = useCallback((e: KeyboardEvent) => {}, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (deps.current.suggestions.state.isActive) {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          deps.current.textarea.value = replaceSuggestionText(
            deps.current.textarea.value,
            deps.current.suggestions.state
          );
          deps.current.suggestions.reset();
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          deps.current.suggestions.up();
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          deps.current.suggestions.down();
          return;
        }

        if (e.key === "Escape") {
          deps.current.suggestions.hide();
          return;
        }
      }

      if (!deps.current.suggestions.state.isActive) {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage(deps.current.channel!, deps.current.textarea.value);
          return;
        }

        if (e.key === "ArrowUp") {
          // @ts-expect-error - wrong types
          const isCaretAtBeginning = e.currentTarget?.selectionStart === 0;

          if (!isCaretAtBeginning) {
            return;
          }

          if (
            deps.current.recentInputsIndex >=
            deps.current.recentInputs.length - 1
          ) {
            return;
          }

          const newIndex = deps.current.recentInputsIndex + 1;

          deps.current.textarea.value =
            deps.current.recentInputs[newIndex] || "";
          setRecentInputsIndex(newIndex);
          return;
        }

        if (e.key === "ArrowDown") {
          const isCaretAtEnd =
            // @ts-expect-error - wrong types
            e.currentTarget.selectionStart === e.currentTarget.value.length;

          if (!isCaretAtEnd) {
            return;
          }

          if (deps.current.recentInputsIndex < 0) {
            return;
          }

          const newIndex = deps.current.recentInputsIndex - 1;

          deps.current.textarea.value =
            deps.current.recentInputs[newIndex] || "";
          setRecentInputsIndex(newIndex);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deps]
  );

  const handleSuggestionMouseEnter = useCallback(
    (activeIndex: number) => suggestions.set({ activeIndex }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSuggestionClick = useCallback(
    (activeIndex: number) => {
      console.log({ activeIndex });
      const d = deps.current;
      const newState = { ...d.suggestions.state, activeIndex };
      d.textarea.value = replaceSuggestionText(d.textarea.value, newState);
      d.textarea.focus();
      d.suggestions.reset();
    },
    [deps]
  );

  const handleEmoteClick = useCallback(
    (name: string) => {
      const d = deps.current;
      d.textarea.value = `${d.textarea.value.trim()} ${name} `;
    },
    [deps]
  );

  return {
    suggestions,
    handleChange,
    handleKeyUp,
    handleKeyDown,
    handleSuggestionMouseEnter,
    handleSuggestionClick,
    handleEmoteClick,
  };
}
