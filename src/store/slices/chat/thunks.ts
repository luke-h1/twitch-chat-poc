import {
  ActionReducerMapBuilder,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { Channel, ChatState, FetchResult } from "./types";
import { RootState } from "@frontend/store";
import twitchService from "@frontend/services/twitchService";
import bttvService from "@frontend/services/bttvService";
import ffzService from "@frontend/services/ffzService";
import stvService from "@frontend/services/stvService";
import chatterinoService from "@frontend/services/chatterinoService";
import recentMessageService from "@frontend/services/recentMessageService";
import {
  parseBlockedUsers,
  parseTwitchBadges,
} from "@frontend/parsers/twitchParsers";

const builderFns: ((builder: ActionReducerMapBuilder<ChatState>) => void)[] =
  [];

export const registerChatThunks = (
  builder: ActionReducerMapBuilder<ChatState>
) => builderFns.forEach((fn) => fn(builder));

interface CreateGlobalChatThunkArgs<TResult> {
  name: string;
  path: (state: ChatState) => FetchResult<TResult>;
  payloadCreator: AsyncThunkPayloadCreator<TResult, void>;
}

const createGlobalChatThunk = <TResult>({
  name,
  path,
  payloadCreator,
}: CreateGlobalChatThunkArgs<TResult>) => {
  const thunk = createAsyncThunk(`chat/${name}`, payloadCreator);

  builderFns.push((builder: ActionReducerMapBuilder<ChatState>) => {
    builder.addCase(thunk.pending, (state) => {
      path(state).status = "pending";
    });
    builder.addCase(thunk.rejected, (state, { error }) => {
      path(state).status = "rejected";
      console.warn(error.message);
    });
    builder.addCase(thunk.fulfilled, (state, { payload }) => {
      path(state).status = "fulfilled";
      path(state).data = payload;
    });
  });
  return thunk;
};

interface FetchChannelThunkArg {
  channelId: string;
  channelName: string;
}

interface CreateChannelChatThunkArgs<TResult> {
  name: string;
  path: (channel: Channel) => FetchResult<TResult>;
  payloadCreator: AsyncThunkPayloadCreator<
    { data: TResult; channelName: string },
    FetchChannelThunkArg
  >;
}

const createChannelChatThunk = <TResult>({
  name,
  path,
  payloadCreator,
}: CreateChannelChatThunkArgs<TResult>) => {
  const thunk = createAsyncThunk(`chat/${name}`, payloadCreator);

  builderFns.push((builder: ActionReducerMapBuilder<ChatState>) => {
    builder.addCase(thunk.pending, (state, { meta: { arg } }) => {
      const channel = state.channels.entities[arg.channelName];
      if (!channel) return;
      path(channel).status = "pending";
    });
    builder.addCase(thunk.rejected, (state, { meta: { arg }, error }) => {
      const channel = state.channels.entities[arg.channelName];
      if (!channel) return;
      path(channel).status = "rejected";
      console.warn(error.message);
    });
    builder.addCase(thunk.fulfilled, (state, { meta: { arg }, payload }) => {
      const channel = state.channels.entities[arg.channelName];
      if (!channel) return;
      path(channel).status = "fulfilled";
      path(channel).data = payload.data;
    });
  });

  return thunk;
};

// blocked users
export const fetchBlockedUsers = createGlobalChatThunk({
  name: "fetchBlockedUsers",
  path: (state) => state.me.blockedUsers,
  payloadCreator: (_, { getState }) => {
    const state = getState() as RootState;
    const { id, accessToken } = state.chat.me;

    return twitchService
      .listUserBlockList(id, accessToken)
      .then(parseBlockedUsers);
  },
});

// recent messages
export const fetchRecentMessages = (() => {
  const thunk = createAsyncThunk(
    "chat/fetchRecentMessages",
    (channelName: string) =>
      recentMessageService.listRecentMessages(channelName)
  );

  builderFns.push((builder: ActionReducerMapBuilder<ChatState>) => {
    builder.addCase(thunk.pending, (state, { meta: { arg } }) => {
      const channel = state.channels.entities[arg];
      if (!channel) return;
      channel.recentMessages.status = "pending";
    });
    builder.addCase(thunk.rejected, (state, { meta: { arg }, error }) => {
      const channel = state.channels.entities[arg];
      if (!channel) return;
      channel.recentMessages.status = "rejected";
      console.warn(error.message);
    });
    builder.addCase(thunk.fulfilled, (state, { meta: { arg }, payload }) => {
      const channel = state.channels.entities[arg];
      if (!channel) return;
      channel.recentMessages.status = "fulfilled";

      let rawMessages = payload.messages;
      const { messagesLimit } = state.options.ui;
      const messagesLength = channel.messages.length;
      const exceededMessages =
        rawMessages.length - messagesLimit + messagesLength;

      if (exceededMessages > 0) {
        rawMessages = payload.messages.slice(exceededMessages);
      }

      const messages = createHistoryMessages(rawMessages, {
        chat: state,
      } as RootState);
      channel.messages = [...messages, ...channel.messages];

      // if we added odd number of messages, invert altBg
      if (messages.length % 2 !== 0) {
        channel.isFirstMessageAltBg = !channel.isFirstMessageAltBg;
      }
    });
  });
  return thunk;
})();

// global emotes
export const fetchAndMergeTwitchEmotes = (() => {
  const thunk = createAsyncThunk(
    "chat/fetchAndMergeTwitchEmotes",
    async (_, { getState }) => {
      const state = getState() as RootState;
      const accessToken = state.chat.me.accessToken!;
      const channel = state.chat.currentChannel!;
      const fetchedIds = state.chat.emotes.twitch.setIds || [];
      const globalIds = state.chat.me.globalUserState?.emoteSets || [];
      const channelIds =
        state.chat.channels.entities[channel]?.userState?.emoteSets || [];
      const allIds = Array.from(new Set([...globalIds, ...channelIds]));
      const diffIds = allIds.filter((id) => !fetchedIds.includes(id));
      if (diffIds.length === 0) return null;
      const response = await twitchService.listEmoteSets(diffIds, accessToken);
      return {
        data: parseTwitchEmotes(response),
        setIds: [...fetchedIds, ...diffIds],
        template: response.template,
      };
    }
  );

  builderFns.push((builder: ActionReducerMapBuilder<ChatState>) => {
    builder.addCase(thunk.pending, (state) => {
      state.emotes.twitch.status = "pending";
    });
    builder.addCase(thunk.rejected, (state, { error }) => {
      state.emotes.twitch.status = "rejected";
      console.warn(error);
    });
    builder.addCase(thunk.fulfilled, (state, { payload }) => {
      const { twitch } = state.emotes;
      twitch.status = "fulfilled";
      if (!payload) return;
      if (twitch.data) {
        twitch.data.entries = {
          ...twitch.data.entries,
          ...payload.data.entries,
        };
        twitch.data.names = {
          ...twitch.data.names,
          ...payload.data.names,
        };
      } else {
        twitch.data = payload.data;
      }
      twitch.setIds = payload.setIds;
      twitch.template = payload.template;
    });
  });

  return thunk;
})();

// global emotes
export const fetchBttvGlobalEmotes = createGlobalChatThunk({
  name: "fetchBttvGlobalEmotes",
  path: (state) => state.emotes.bttv,
  payloadCreator: () =>
    bttvService.listGlobalEmotes().then(parseBttvGlobalEmotes),
});
export const fetchFfzGlobalEmotes = createGlobalChatThunk({
  name: "fetchFfzGlobalEmotes",
  path: (state) => state.emotes.ffz,
  payloadCreator: () =>
    ffzService.listGlobalEmotes().then(parseFfzGlobalEmotes),
});
export const fetchStvGlobalEmotes = createGlobalChatThunk({
  name: "fetchStvGlobalEmotes",
  path: (state) => state.emotes.stv,
  payloadCreator: () =>
    stvService.listGlobalEmotes().then(parseStvGlobalEmotes),
});
export const fetchFfzEmoji = createGlobalChatThunk({
  name: "fetchFfzEmoji",
  path: (state) => state.emotes.emoji,
  payloadCreator: () => ffzService.listEmoji().then(parseFfzEmoji),
});

// global badges
export const fetchTwitchGlobalBadges = createGlobalChatThunk({
  name: "fetchTwitchGlobalBadges",
  path: (state) => state.badges.twitch,
  payloadCreator: (_, { getState }) => {
    const state = getState() as RootState;
    const { accessToken } = state.chat.me;
    return twitchService.listGlobalBadges(accessToken).then(parseTwitchBadges);
  },
});
export const fetchBttvGlobalBadges = createGlobalChatThunk({
  name: "fetchBttvGlobalBadges",
  path: (state) => state.badges.bttv,
  payloadCreator: () =>
    bttvService.listGlobalBadges().then(parseBttvGlobalBadges),
});
export const fetchFfzGlobalBadges = createGlobalChatThunk({
  name: "fetchFfzGlobalBadges",
  path: (state) => state.badges.ffz,
  payloadCreator: () =>
    ffzService.listGlobalBadges().then(parseFfzGlobalBadges),
});
export const fetchFfzApGlobalBadges = createGlobalChatThunk({
  name: "fetchFfzApGlobalBadges",
  path: (state) => state.badges.ffzAp,
  payloadCreator: () =>
    ffzService.listApGlobalBadges().then(parseFfzApGlobalBadges),
});
export const fetchStvGlobalBadges = createGlobalChatThunk({
  name: "fetchStvGlobalBadges",
  path: (state) => state.badges.stv,
  payloadCreator: () =>
    stvService.listCosmetics().then((r) => parseStvCosmetics(r).badges),
});
export const fetchChatterinoGlobalBadges = createGlobalChatThunk({
  name: "fetchChatterinoGlobalBadges",
  path: (state) => state.badges.chatterino,
  payloadCreator: () =>
    chatterinoService.listGlobalBadges().then(parseChatterinoBadges),
});
