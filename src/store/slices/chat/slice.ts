import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Channel, ChatState, LocalStorageChannels } from "./types";
import { EntityState } from "@reduxjs/toolkit";
import getInitialOptions from "@frontend/store/options/getInitialOptions";
import { CHANNEL_INITIAL_STATE } from "./config";
import { RootState } from "@frontend/store";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const channelsAdapter = createEntityAdapter<Channel>({
  selectId: (channel) => channel.name,
});

const initialState: ChatState = {
  isConnected: false,
  isRegistered: false,
  me: {
    authStatus: "uninitialized",
    blockedUsers: { status: "idle" },
  },
  channels: channelsAdapter.getInitialState(),
  emotes: {
    twitch: { status: "idle" },
    bttv: { status: "idle" },
    ffz: { status: "idle" },
    stv: { status: "idle" },
    emoji: { status: "idle" },
  },
  badges: {
    twitch: { status: "idle" },
    bttv: { status: "idle" },
    ffz: { status: "idle" },
    ffzAp: { status: "idle" },
    stv: { status: "idle" },
    chatterino: { status: "idle" },
  },
  options: getInitialOptions(),
};

type AuthStatusChangedPayload =
  | ({
      authStatus: "success";
    } & Pick<
      ChatState["me"],
      "id" | "login" | "displayName" | "picture" | "accessToken"
    >)
  | { authStatus: "error" };

type OptionChangedPayload = {
  section: keyof ChatState["options"];
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

const chat = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // auth
    authStatusChanged: (
      state,
      { payload }: PayloadAction<AuthStatusChangedPayload>
    ) => {
      if (payload.authStatus === "success") {
        state.me.authStatus = payload.authStatus;
        state.me.id = payload.id;
        state.me.login = payload.login;
        state.me.displayName = payload.displayName;
        state.me.picture = payload.picture;
        state.me.accessToken = payload.accessToken;
      }

      if (payload.authStatus === "error") {
        state.me.authStatus = payload.authStatus;
        state.me.id = undefined;
        state.me.login = undefined;
        state.me.displayName = undefined;
        state.me.picture = undefined;
        state.me.accessToken = undefined;
      }
    },
    // connection
    chatConnected: (state) => {
      state.isConnected = true;
    },
    chatDisconnected: (state) => {
      state.isConnected = false;
      state.isRegistered = false;
    },
    chatRegistered: (state) => {
      state.isRegistered = true;
    },

    // channels
    channelsInitialized: (
      state,
      { payload }: PayloadAction<LocalStorageChannels>
    ) => {
      channelsAdapter.addMany(
        state.channels,
        payload.map(([name, id]) => ({
          ...CHANNEL_INITIAL_STATE,
          id,
          name,
        }))
      );
    },
    // add a channel to a chat
    channelAdded: (state, { payload }: PayloadAction<string>) => {
      if (!state.currentChannel) state.currentChannel = payload;
      channelsAdapter.addOne(state.channels, {
        name: payload,
        ...CHANNEL_INITIAL_STATE,
      });
    },
    // remove channel from a chat
    channelRemoved: (state, { payload }: PayloadAction<string>) => {
      channelsAdapter.removeOne(state.channels, payload);
      if (state.currentChannel === payload) {
        state.currentChannel = state.channels.ids[0] as string;
      }
    },
    // user has swapped to this chat
    currentChannelChanged: (state, { payload }: PayloadAction<string>) => {
      state.currentChannel = payload;
    },

    // load badges, emotes etc. for a given chat
    channelResourcesLoaded: (state) => {
      const channel = state.channels.entities[state.currentChannel!];
      if (!channel) {
        return;
      }

      channel.ready = true;

      // parse parts, badges, cards for all messages
      const dummyState = { chat: state } as RootState;

      const createBadges = createCreate;
    },
  },
});
