import { MessageType, MessageTypeNotice } from "@frontend/types/messages";
import { nanoid } from "@reduxjs/toolkit";

const createCustomNotice = (
  channelName: string,
  body: string
): MessageTypeNotice => ({
  type: MessageType.NOTICE,
  id: nanoid(),
  channelName,
  body,
  noticeType: "",
});

export default createCustomNotice;
