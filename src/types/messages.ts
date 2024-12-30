import { MessageBadge } from "@frontend/store/slices/badges/types";
import { ChatMessage } from "@twurple/chat";

export enum MessageType {
  PRIVATE_MESSAGE = 0,
  NOTICE = 1,
  USER_NOTICE = 2,
}

export enum MessagePartType {
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

export interface MessagePartText {
  type: MessagePartType.TEXT;
  content: string;
}

interface MessagePartEmoteContent {
  id: string;
  modifiers: MessagePartEmoteModifier[];
}

// twitch message
export interface MessagePartTwitchEmote {
  type: MessagePartType.TWITCH_EMOTE;
  content: MessagePartEmoteContent;
}

// bttv emote
export interface MessagePartBttvEmote {
  type: MessagePartType.BTTV_EMOTE;
  content: MessagePartEmoteContent;
}

// ffz emote
export interface MessagePartFfzEmote {
  type: MessagePartType.FFZ_EMOTE;
  content: MessagePartEmoteContent;
}

// seven tv emote
export type MessagePartStvEmote = {
  type: MessagePartType.STV_EMOTE;
  content: MessagePartEmoteContent;
};

// emoji emote
export type MessagePartEmoji = {
  type: MessagePartType.EMOJI;
  content: MessagePartEmoteContent;
};

// mention
export interface MessagePartMention {
  type: MessagePartType.MENTION;
  content: {
    displayText: string;
    recipient: string;
  };
}

// link
export interface MessagePartLink {
  type: MessagePartType.LINK;
  content: {
    displayText: string;
    url: string;
  };
}

// twitch clip
export type MessagePartTwitchClip = {
  type: MessagePartType.TWITCH_CLIP;
  content: {
    displayText: string;
    slug: string;
    url: string;
  };
};

// twitch video
export interface MessagePartTwitchVideo {
  type: MessagePartType.TWITCH_VIDEO;
  content: {
    displayText: string;
    id: string;
    url: string;
  };
}

export type MessagePart =
  | MessagePartText
  | MessagePartTwitchEmote
  | MessagePartBttvEmote
  | MessagePartFfzEmote
  | MessagePartStvEmote
  | MessagePartEmoji
  | MessagePartMention
  | MessagePartLink
  | MessagePartTwitchClip
  | MessagePartTwitchVideo;

export type MessagePartEmote =
  | MessagePartTwitchEmote
  | MessagePartBttvEmote
  | MessagePartFfzEmote
  | MessagePartStvEmote
  | MessagePartEmoji;

export type MessagePartEmoteModifier =
  | MessagePartBttvEmote
  | MessagePartFfzEmote
  | MessagePartStvEmote;

interface MessageUser {
  id: string;
  login: string;
  displayName?: string;
  color?: string;
}

interface MessagePrivateTags {
  emotes?: string;
  badges?: string;
}

interface AMessage {
  id: string;
  channelName: string;
  timestamp: number;
  user: MessageUser;
  badges: MessageBadge[];
  parts: MessagePart[];
  body: string;
  _tags: MessagePrivateTags;
}

export type MessageTypePrivate = AMessage & ChatMessage;

export type MessageTypeUserNotice = AMessage & {
  type: MessageType.USER_NOTICE;
  /** @see https://dev.twitch.tv/docs/irc/tags#usernotice-tags */
  noticeType: string;
  systemMessage: string;
};

export interface MessageTypeNotice {
  type: MessageType.NOTICE;
  id: string;
  channelName: string;
  body: string;
  /** @see https://dev.twitch.tv/docs/irc/msg-id */
  noticeType: string;
}

export type Messages =
  | MessageTypePrivate
  | MessageTypeUserNotice
  | MessageTypeNotice;
