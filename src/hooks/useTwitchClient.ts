import { MessageTypes } from "ircv3";
import { AuthProvider, StaticAuthProvider } from "@twurple/auth";
import {
  ChatClient,
  GlobalUserState,
  PrivateMessage,
  RoomState,
  UserNotice,
  UserState,
} from "@twurple/chat";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import {
  accessTokenSelector,
  authStatusSelector,
  channelNamesSelector,
} from "@frontend/store/slices/chat/selectors";
import { useEffect, useRef } from "react";
import {
  chatConnected,
  chatDisconnected,
  chatRegistered,
  clearChatReceived,
  clearMsgReceived,
  globalUserStateReceived,
  messageReceived,
  roomStateReceived,
  userStateReceived,
} from "@frontend/store/slices/chat/slice";
import getIrcChannelName from "@frontend/util/getChannelName";
import createCustomNotice from "@frontend/util/createCustomNotice";
import {
  parseGlobalUserState,
  parseRoomState,
  parseUserState,
} from "@frontend/util/parseIrc";
import {
  noticeReceived,
  privateMessageReceived,
  userNoticeReceived,
} from "@frontend/store/slices/chat/thunks";
import toDaysMinutesSeconds from "@frontend/util/toDaysMinutesSeconds";

const useTwitchClient = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(authStatusSelector);
  const accessToken = useAppSelector(accessTokenSelector);
  const channelNames = useAppSelector(channelNamesSelector);

  const chatRef = useRef<ChatClient | null>(null);
  const channelNamesRef = useRef<string[]>([]);

  channelNamesRef.current = channelNames;

  useEffect(() => {
    if (authStatus === "uninitialized" || chatRef.current) return;

    let authProvider: AuthProvider | undefined;

    if (authStatus === "success" && accessToken) {
      authProvider = new StaticAuthProvider(
        process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
        accessToken
      );
    }

    const chat = new ChatClient({ authProvider });

    chatRef.current = chat;

    chat.onConnect(() => {
      dispatch(chatConnected());
    });

    chat.onDisconnect((manually, reason) => {
      dispatch(chatDisconnected());
      console.warn(`Disconnected. ${reason}`);
    });

    chat.onRegister(() => {
      channelNamesRef.current.forEach((channel) =>
        chat
          .join(channel)
          .catch((e) =>
            dispatch(messageReceived(createCustomNotice(channel, e.message)))
          )
      );
      dispatch(chatRegistered());
    });

    chat.onAuthenticationFailure((message, retryCount) => {
      console.warn(message, retryCount);
    });

    chat.onTypedMessage(GlobalUserState, (msg) => {
      dispatch(globalUserStateReceived(parseGlobalUserState(msg)));
    });

    chat.onTypedMessage(UserState, (msg) => {
      const userState = parseUserState(msg);
      const channelName = getIrcChannelName(msg);
      dispatch(userStateReceived({ channelName, userState }));
    });

    chat.onTypedMessage(RoomState, (msg) => {
      const roomState = parseRoomState(msg);
      const channelName = getIrcChannelName(msg);
      dispatch(roomStateReceived({ channelName, roomState }));
    });

    // ClearChat
    chat.onBan((channelName, login) => {
      const messageBody = `${login} has been permanently banned.`;
      dispatch(clearChatReceived({ channelName, login }));
      dispatch(createCustomNotice(channelName, messageBody));
    });

    chat.onTimeout((channelName, login, duration) => {
      const durationText = toDaysMinutesSeconds(duration);
      const messageBody = `${login} has been timed out for ${durationText}.`;
      dispatch(clearChatReceived({ channelName, login }));
      dispatch(createCustomNotice(channelName, messageBody));
    });

    chat.onChatClear((channelName) => {
      dispatch(clearChatReceived({ channelName }));
    });

    // ClearMsg
    chat.onMessageRemove((channelName, messageId) => {
      dispatch(clearMsgReceived({ channelName, messageId }));
    });

    // HostTarget
    // chat.onHost((channel, target, viewers) => {});
    // chat.onUnhost((channel) => {});

    // chat.onJoin(() => {});
    // chat.onJoinFailure(() => {});
    // chat.onPart(() => {});

    chat.onTypedMessage(PrivateMessage, (msg) => {
      dispatch(privateMessageReceived(msg));
    });

    chat.onTypedMessage(UserNotice, (msg) => {
      dispatch(userNoticeReceived(msg));
    });

    chat.onTypedMessage(MessageTypes.Commands.Notice, (msg) => {
      dispatch(noticeReceived(msg));
    });

    // Privmsg
    // chat.onHosted((channel, byChannel, auto, viewers) => {});
    // chat.onMessage((channel, user, message, msg) => {});
    // chat.onAction((channel, user, message, msg) => {});

    // RoomState
    // this.onSlow
    // this.onFollowersOnly

    // UserNotice
    // this.onSub
    // this.onResub
    // this.onSubGift
    // this.onCommunitySub
    // this.onPrimePaidUpgrade
    // this.onGiftPaidUpgrade
    // this.onStandardPayForward
    // this.onCommunityPayForward
    // this.onPrimeCommunityGift
    // this.onRaid
    // this.onRaidCancel
    // this.onRitual
    // this.onBitsBadgeUpgrade
    // this.onSubExtend
    // this.onRewardGift
    // this.onAnnouncement

    // Whisper
    // this.onWhisper

    // Notice
    // this.onEmoteOnly
    // this.onHostsRemaining
    // this.onR9k
    // this.onSubsOnly
    // this.onNoPermission
    // this.onMessageRatelimit
    // this.onMessageFailed

    chat.connect();
  }, [authStatus, accessToken]);

  return chatRef;
};
export default useTwitchClient;
