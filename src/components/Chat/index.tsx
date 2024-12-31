import useAuth from "@frontend/hooks/useAuth";
import useFetchChatData from "@frontend/hooks/useFetchChatData";
import useInitializeTabs from "@frontend/hooks/useInitializeTabs";
import useTwitchClient from "@frontend/hooks/useTwitchClient";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import { emotesSelector } from "@frontend/store/selectors/emote";
import { currentChannelNameSelector } from "@frontend/store/slices/chat/selectors";
import { messageSended } from "@frontend/store/slices/chat/thunks";
import { AllEmotes } from "@frontend/store/slices/emotes/types";
import replaceEmojis from "@frontend/util/replaceEmojis";
import { useCallback, useRef } from "react";
import styles from "./Chat.module.scss";
import ChatTabs from "./ChatTabs";
import ChatMessages from "./ChatMessages";

export default function Chat() {
  const dispatch = useAppDispatch();

  const channel = useAppSelector(currentChannelNameSelector);
  const emotes = useAppSelector(emotesSelector);

  useAuth();
  const chatRef = useTwitchClient();
  useFetchChatData();
  useInitializeTabs();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<string | undefined>(undefined);
  const emotesRef = useRef<AllEmotes | undefined>(undefined);

  channelRef.current = channel;
  emotesRef.current = emotes;

  const sendMessage = useCallback(
    (channelName: string, message: string) => {
      if (!textareaRef.current || !chatRef.current || !message.trim()) return;
      textareaRef.current.value = "";
      const normalizedMessage = replaceEmojis(
        emotesRef.current?.emoji,
        message.trim()
      );
      chatRef.current.say(channelName, normalizedMessage);
      dispatch(messageSended({ channelName, message: normalizedMessage }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatRef, textareaRef, emotesRef]
  );

  const handleSendMessage = useCallback(() => {
    const channel = channelRef.current;
    const text = textareaRef.current?.value;
    if (!channel || !text) return;
    sendMessage(channel, text);
  }, [textareaRef, channelRef, sendMessage]);

  const handleNameRightClick = useCallback(
    (name: string) => {
      if (!textareaRef.current) return;
      textareaRef.current.value = `${textareaRef.current.value.trim()} @${name} `;
      textareaRef.current.focus();
    },
    [textareaRef]
  );

  return (
    <div className={styles.root}>
      <ChatTabs chat={chatRef} />
      <ChatMessages onNameRightClick={handleNameRightClick} />
    </div>
  );
}
