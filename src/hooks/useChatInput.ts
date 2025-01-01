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
  }, []);
}
