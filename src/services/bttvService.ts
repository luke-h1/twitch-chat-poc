import { BttvGlobalBadgesResponse } from "@frontend/types/bttv/badge";
import { bttvApi } from "./api";
import {
  BttvChannelEmotesResponse,
  BttvGlobalEmotesResponse,
} from "@frontend/types/bttv/emote";

const bttvService = {
  listGlobalEmotes: async (): Promise<BttvGlobalEmotesResponse> => {
    const { data } = await bttvApi.get<BttvGlobalEmotesResponse>(
      "/cached/emotes/global"
    );
    return data;
  },
  listChannelEmotes: async (
    channelId: string
  ): Promise<BttvChannelEmotesResponse> => {
    const { data } = await bttvApi.get<BttvChannelEmotesResponse>(
      `/cached/users/twitch/${channelId}`
    );
    return data;
  },
  listGlobalBadges: async (): Promise<BttvGlobalBadgesResponse> => {
    const { data } = await bttvApi.get<BttvGlobalBadgesResponse>(
      "/cached/badges"
    );
    return data;
  },
} as const;

export default bttvService;
