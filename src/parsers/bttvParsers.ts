import { BttvBadge } from "@frontend/types/bttv/badge";
import {
  BttvChannelEmotesResponse,
  BttvCommonEmote,
  BttvDetailedEmote,
  BttvGlobalEmotesResponse,
} from "@frontend/types/bttv/emote";
import { Badge, Emote } from "@frontend/types/util";

export const parseBttvGlobalEmotes = (
  data: BttvGlobalEmotesResponse
): Emote<BttvCommonEmote> => {
  const result: Emote<BttvCommonEmote> = { entries: {}, names: {} };

  for (const emote of data) {
    result.entries[emote.id] = emote;
    result.names[emote.code] = emote.id;
  }

  return result;
};

export const parseBttvChannelEmotes = (
  data: BttvChannelEmotesResponse
): Emote<BttvDetailedEmote> => {
  const result: Emote<BttvDetailedEmote> = { entries: {}, names: {} };

  for (const emote of data.channelEmotes) {
    result.entries[emote.id] = emote;
    result.names[emote.code] = emote.id;
  }

  for (const emote of data.sharedEmotes) {
    result.entries[emote.id] = emote;
    result.names[emote.code] = emote.id;
  }

  return result;
};

export const parseBttvGlobalBadges = (data: BttvBadge[]): Badge<BttvBadge> => {
  const result: Badge<BttvBadge> = { entries: {}, users: {} };

  for (const badge of data) {
    result.entries[badge.id] = badge;
    result.users[badge.providerId] = [badge.id];
  }

  return result;
};
