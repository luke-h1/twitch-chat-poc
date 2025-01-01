import styled from "@emotion/styled";
import IconButton from "../IconButton";
import { useState } from "react";
import Profile from "../Chat/Profile";
import Modal from "../Modal";
import { useAppSelector } from "@frontend/store/hooks";
import {
  authStatusSelector,
  isRegisteredSelector,
} from "@frontend/store/slices/chat/selectors";
import OptionsCategories from "../OptionsCategories";

const ChatControlsRoot = styled.div`
  position: relative;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
`;
const Controls = styled.div`
  display: flex;
  align-items: center;
`;
const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;

  & > :not(:last-child) {
    margin-right: 8px;
  }
`;

const IconButtonA = IconButton as unknown as ReturnType<typeof styled.a>;

interface Props {
  onChatClick: () => void;
}

export default function ChatControls({ onChatClick }: Props) {
  const authStatus = useAppSelector(authStatusSelector);
  const isRegistered = useAppSelector(isRegisteredSelector);

  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false);

  const handleCloseOptions = () => setIsOptionsVisible(false);

  return (
    <ChatControlsRoot>
      <Controls>
        <Profile />
        <ControlButtons>
          <IconButtonA
            as="a"
            title="Github Repo"
            href="https://github.com/luke-h1/twitch-chat-poc"
            target="_blank"
            rel="noreferrer noopener"
          >
            gh
          </IconButtonA>
          <IconButton
            title="Chat settings"
            onClick={() => setIsOptionsVisible((prev) => !prev)}
          >
            gears
          </IconButton>
          <button
            disabled={!(isRegistered && authStatus === "success")}
            onClick={onChatClick}
          >
            Chat
          </button>
        </ControlButtons>
      </Controls>{" "}
      <Modal
        title="Chat settings"
        isOpen={isOptionsVisible}
        onClose={handleCloseOptions}
      >
        <OptionsCategories />
      </Modal>
    </ChatControlsRoot>
  );
}
