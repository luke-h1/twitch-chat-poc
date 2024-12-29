import { EntityState } from "@reduxjs/toolkit";
import { Options } from "../options";
import { StvEmote } from "@frontend/types/stv";
import { TwitchBadges } from "@frontend/types/twitch/badge";
import { Badge, Emote } from "@frontend/types/util";
import { TwitchEmote } from "@frontend/types/twitch/emote";

type TStatus = "idle" | "pending" | "fulfilled" | "rejected";
type AuthStatus = "uninitialized" | "success" | "error";

export type FetchResult<
  TResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  A extends Record<string, any> = Record<string, any>
> = {
  status: TStatus;
  data?: TResult;
} & A;

export type UserType = "" | "admin" | "global_mod" | "staff";

export interface GlobalUserStateTags {
  badgeInfo: Record<string, string>;
  badges: Record<string, string>;
  color?: string;
  displayName?: string;
  emoteSets: string[];
  userId: string;
  userType: UserType;
}

export interface UserStateTags {
  badgeInfo: Record<string, string>;
  badges: Record<string, string>;
  color?: string;
  displayName?: string;
  emoteSets: string[];
  mod: boolean;
  subscriber: boolean;
  userType: UserType;
}

export interface RoomStateTags {
  emoteOnly: boolean;
  followersOnly: false | number;
  r9k: boolean;
  roomId: string;
  slow: number;
  subsOnly: boolean;
}

export interface Channel {
  id?: string;
  name: string;
  messages: Messages[];
  recentMessages: FetchResult<string[]>;
  ready: boolean;

  /*
   * First msg in array should have alternative bg. Used in split chat
   */
  isFirstMessageAltBg: boolean;

  roomState?: RoomStateTags;
  userState?: UserStateTags;

  /**
   * Users in the chat. Used for autocomplete when typing `@`
   */
  users: string[];

  /**
   * Recent user inputs in a given channel
   */
  recentInputs: string[];

  /**
   * First party emotes in the channel
   */
  emotes: {
    bttv: FetchResult<Emote<BttvEmote>>;
    ffz: FetchResult<Emote<FfzEmote>>;
    stv: FetchResult<Emote<StvEmote>>;
  };

  /**
   * Badges in a given channel
   * TODO: fetch stv, bttv badges
   */
  badges: {
    twitch: FetchResult<TwitchBadges>;
  };
}

interface Me {
  authStatus: AuthStatus;
  id?: string;
  login?: string;
  displayName?: string;
  picture?: string;
  accessToken?: string;
  globalUserState: GlobalUserStateTags;
  blockedUsers: FetchResult<string[]>;
}

export interface ChatState {
  isConnected: boolean;
  isRegistered: boolean;
  me: Me;
  channels: EntityState<Channel>;
  currentChannel?: string;

  // Emotes
  emotes: {
    twitch: FetchResult<
      Emote<TwitchEmote>,
      { setIds?: string[]; template?: string }
    >;
    bttv: FetchResult<Emote<BttvEmote>>;
    ffz: FetchResult<Emote<FfzEmote>>;
    stv: FetchResult<Emote<StvEmote>>;
    emoji: FetchResult<Emote<Emoji>>;
  };

  // Badges
  badges: {
    twitch: FetchResult<Badge<TwitchBadges>>;
    bttv: FetchResult<Badge<BttvBadge>>;
    ffz: FetchResult<Badge<FfzBadge>>;

    // todo doc this
    ffzAp: FetchResult<Badge<FfzApBadge>>;

    stv: FetchResult<Badge<StvBadge>>;

    // chatterino - todo look into this
    chatterino: FetchResult<Badge<ChatterinoBadge>>;
  };

  options: Options;
}

interface ASuggestions {
  isActive: boolean;
  activeIndex: number;
  start: number;
  end: number;
}

type UserSuggestions = ASuggestions & {
  type: "users";
  items: string[];
};

type EmoteSuggestions = ASuggestions & {
  type: "emotes";
  items: HtmlEmote[];
};

export type SuggestionState = UserSuggestions | EmoteSuggestions;

export type SendMessageFn = (channel: string, message: string) => void;
