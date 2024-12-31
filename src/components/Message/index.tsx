import { Messages, MessageType } from "@frontend/types/messages";
import MessageNotice from "./MessageNotice";
import MessageUserNotice from "./MessageUserNotice";
import MessagePrivate from "./MessagePrivate";

interface Props {
  message: Messages;
  isAltBg: boolean;
  onNameClick?: (name: string) => void;
  onNameRightClick?: (name: string) => void;
}

const assertNever = (value: never): never => value;

const Message = ({
  isAltBg,
  message,
  onNameClick = () => {},
  onNameRightClick = () => {},
}: Props) => {
  if (message.type === MessageType.PRIVATE_MESSAGE) {
    return (
      <MessagePrivate
        message={message}
        isAltBg={isAltBg}
        onNameClick={onNameClick}
        onNameRightClick={onNameRightClick}
      />
    );
  }
  if (message.type === MessageType.USER_NOTICE) {
    return <MessageUserNotice message={message} />;
  }

  if (message.type === MessageType.NOTICE) {
    return <MessageNotice isAltBg={isAltBg} message={message} />;
  }

  return assertNever(message);
};
export default Message;
