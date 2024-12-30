import { nanoid } from "@reduxjs/toolkit";
import { parseMessage, Message, type MessageTypes } from "ircv3";
import { ChatMessage, UserNotice } from "@twurple/chat";
import { RootState } from "@frontend/store";
import { MessageType, MessageTypePrivate } from "@frontend/types/messages";
import getIrcChannelName from "./getChannelName";

const parsePrivMsgBody = (
  content: string
): [body: string, isAction: boolean] => {
  return content.startsWith("\u0001ACTION ")
    ? [content.slice(8, -1), true]
    : [content, false];
};

// badges
export const createCreateBadges = (state: RootState) => {
  const allBadges = badgesSelector(state);
  return (userId: string, badgesTag = "", badges?: Record<string, string>) => {
    const userBadges = badges || parseBadgesTag(badgesTag);
    return createMessageBadges(allBadges, userBadges, userId);
  };
};

// parts
export const createCreateParts = (state: RootState) => {
  const allEmotes = emotesSelector(state);

  return (body: string, emotesTag = "", isSelf = false) => {
    return createMessageParts(body, allEmotes, emotesTag, isSelf);
  };
};

// card
export const createCreateCard = (state: RootState) => {
  const { twitch, youtube } = showCardsSelector(state);

  return (parts: MessagePart[]) => createMessageCard(parts, twitch, youtube);
};

export const createPrivateMessage = (state: RootState) => {
  const createBadges = createCreateBadges(state);
  const createParts = createCreateParts(state);
  const createCard = createCreateCard(state);
  const blockedUsers = blockedUsersSelector(state);
  const highlightRegExp = highlightRegExpSelector(state);

  return (msg: ChatMessage): MessageTypePrivate | null => {
    const user = msg.userInfo;

    if (blockedUsers?.includes(user.userName)) {
      return null;
    }

    const channelName = getIrcChannelName(msg);

    const [body, isAction] = parsePrivMsgBody(msg.text);

    const _tags: MessageTypePrivate["_tags"] = {
      emotes: msg.tags.get("emotes") || "",
      badges: msg.tags.get("badges") || "",
    };

    const parts = createParts(body, _tags.emotes);
    const badges = createBadges(user.userId, _tags.badges);
    const card = createCard(parts);

    return {
      type: MessageType.PRIVATE_MESSAGE,
      id: msg.id,
      channelName,
      timestamp: msg.date.getTime(),
      user: {
        id: user.userId,
        login: user.userName,
        displayName: user.displayName,
        color: user.color,
      },
      badges,
      parts,
      body,
      card,
      isCheer: msg.isCheer,
      isRedemption: msg.isRedemption,
      isPointsHighlight: msg.isHighlight,
      isAction,
      isDeleted: false,
      isHistory: false,
      isSelf: false,
      isHighlighted: !!highlightRegExp?.test(body),
      _tags,
    };
  };
};

export const createPrivateMessage = (state: RootState) => {
  const createBadges = createCreateBadges(state);
  const createParts = createCreateParts(state);
  const createCard = createCreateCard(state);
  const blockedUsers = blockedUsersSelector(state);
  const highlightRegExp = highlightRegExpSelector(state);

  return (msg: ChatMessage): MessageTypePrivate | null => {
    const user = msg.userInfo;

    if (blockedUsers?.includes(user.userName)) {
      return null;
    }

    const channelName = getIrcChannelName(msg);

    const [body, isAction] = parsePrivMsgBody(msg.text);

    const _tags: MessageTypePrivate["_tags"] = {
      emotes: msg.tags.get("emotes") || "",
      badges: msg.tags.get("badges") || "",
    };

    const parts = createParts(body, _tags.emotes);
    const badges = createBadges(user.userId, _tags.badges);
    const card = createCard(parts);

    return {
      type: MessageType.PRIVATE_MESSAGE,
      id: msg.id,
      channelName,
      timestamp: msg.date.getTime(),
      user: {
        id: user.userId,
        login: user.userName,
        displayName: user.displayName,
        color: user.color,
      },
      badges,
      parts,
      body,
      card,
      isCheer: msg.isCheer,
      isRedemption: msg.isRedemption,
      isPointsHighlight: msg.isHighlight,
      isAction,
      isDeleted: false,
      isHistory: false,
      isSelf: false,
      isHighlighted: !!highlightRegExp?.test(body),
      _tags,
    };
  };
};
