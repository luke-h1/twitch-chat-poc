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

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {},
  []);
}
