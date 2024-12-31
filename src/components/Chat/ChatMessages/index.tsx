import { useAppSelector } from "@frontend/store/hooks";
import { splitChatSelector } from "@frontend/store/options/selectors";
import {
  currentChannelMessagesSelector,
  isFirstMessageAltBgSelector,
} from "@frontend/store/slices/chat/selectors";
import { memo, useEffect, useRef, useState } from "react";
import styles from "./ChatMessages.module.scss";
import Message from "@frontend/components/Message";

interface Props {
  onNameClick?: (name: string) => void;
  onNameRightClick?: (name: string) => void;
}
const MORE_MESSAGES_OFFSET = 128;

const getIsAltBg = (isFirstAltBg: boolean | undefined, i: number) =>
  i % 2 === 0 ? !isFirstAltBg : !!isFirstAltBg;

const ChatMessages = ({ onNameClick, onNameRightClick }: Props) => {
  const [isButtonVisible, setIsButtonVisible] = useState<boolean>(false);

  const messages = useAppSelector(currentChannelMessagesSelector);
  const isFirstAltBg = useAppSelector(isFirstMessageAltBgSelector);
  const splitChat = useAppSelector(splitChatSelector);

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const el = e.currentTarget;
    const maxScrollTop = el.scrollHeight - el.offsetHeight;
    const isVisible = maxScrollTop - el.scrollTop > MORE_MESSAGES_OFFSET;
    setIsButtonVisible(isVisible);
  };

  const handleScrollToBottom = () => {
    chatMessagesRef.current?.scroll({
      top: chatMessagesRef.current?.scrollHeight,
    });
  };

  useEffect(() => {
    if (!isButtonVisible) handleScrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <div className={styles.root}>
      <div
        className={styles.container}
        onScroll={handleScroll}
        ref={chatMessagesRef}
      >
        {messages.map((message, i) => (
          <Message
            key={message.id}
            message={message}
            isAltBg={splitChat ? getIsAltBg(isFirstAltBg, i) : false}
            onNameClick={onNameClick}
            onNameRightClick={onNameRightClick}
          />
        ))}
      </div>
      {isButtonVisible && (
        <button className="button" onClick={handleScrollToBottom}>
          More messages bellow
        </button>
      )}
    </div>
  );
};
export default memo(ChatMessages);
