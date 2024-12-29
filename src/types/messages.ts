import { ChatMessage } from "@twurple/chat";

export enum MessageType {
  PRIVATE_MESSAGE = 0,
  NOTICE = 1,
  USER_NOTICE = 2,
}

export enum MessagePart {
  TEXT = 0,
  MENTION = 4,
  LINK = 5,
  TWITCH_EMOTE = 6,
  TWITCH_CLIP = 7,
  TWITCH_VIDEO = 8,

  BTTV_EMOTE = 101,
  FFZ_EMOTE = 102,
  STV_EMOTE = 103,
  EMOJI = 104,
}

export const IRCV3_KNOWN_COMMANDS = new Map([["PRIVMSG", ChatMessage]]);

export interface MessagepartText {
  type: MessagePart.TEXT;
  content: string;
}

interface MessagePartEmoteContent {
  id: string;
  modifiers: MessagePartEmoteModifier[];
}

// twitch message
export interface MessagePartTwitchEmote {
  type: MessagePart.TWITCH_EMOTE;
  content: MessagePartEmoteContent;
}

// bttv emote
export interface MessagePartBttvEmote {
  type: MessagePart.BTTV_EMOTE;
  content: MessagePartEmoteContent;
}
