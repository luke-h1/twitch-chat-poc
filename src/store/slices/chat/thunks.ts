import {
  ActionReducerMapBuilder,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { Channel, ChatState, FetchResult } from "./types";

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

const createGlobalChatThunkArgs = <TResult>({
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
}: CreateChannelChatThunkArgs<TResult>) => {};
