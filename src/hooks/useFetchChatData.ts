/* eslint-disable react-hooks/exhaustive-deps */
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import { optionsSelector } from "@frontend/store/options/selectors";
import {
  authStatusSelector,
  accessTokenSelector,
  currentChannelIdSelector,
  currentChannelNameSelector,
  channelNamesSelector,
  isJoinedCurrentChannelSelector,
  fetchGlobalStatusSelector,
  fetchChannelStatusSelector,
  fetchRecentMessagesStatusSelector,
  isChannelReadySelector,
  isChannelResourcesLoadedSelector,
} from "@frontend/store/slices/chat/selectors";
import { channelResourcesLoaded } from "@frontend/store/slices/chat/slice";
import {
  fetchBlockedUsers,
  fetchTwitchGlobalBadges,
  fetchTwitchChannelBadges,
  fetchAndMergeTwitchEmotes,
  fetchBttvGlobalEmotes,
  fetchBttvGlobalBadges,
  fetchFfzGlobalEmotes,
  fetchFfzEmoji,
  fetchFfzGlobalBadges,
  fetchFfzApGlobalBadges,
  fetchStvGlobalEmotes,
  fetchChatterinoGlobalBadges,
  fetchBttvChannelEmotes,
  fetchFfzChannelEmotes,
  fetchStvChannelEmotes,
  fetchRecentMessages,
} from "@frontend/store/slices/chat/thunks";
import { useEffect } from "react";

const useFetchChatData = () => {
  // TODO: fix dispatch types
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(authStatusSelector);
  const accessToken = useAppSelector(accessTokenSelector);
  const channelId = useAppSelector(currentChannelIdSelector);
  const channelName = useAppSelector(currentChannelNameSelector);
  const channelNames = useAppSelector(channelNamesSelector);
  const isJoined = useAppSelector(isJoinedCurrentChannelSelector);
  const options = useAppSelector(optionsSelector);
  const fetchGlobalStatus = useAppSelector(fetchGlobalStatusSelector);
  const fetchChannelStatus = useAppSelector(fetchChannelStatusSelector);
  const fetchRecentMessagesStatus = useAppSelector(
    fetchRecentMessagesStatusSelector
  );

  const isChannelReady = useAppSelector(isChannelReadySelector);
  const isChannelResourcesLoaded = useAppSelector(
    isChannelResourcesLoadedSelector
  );

  useEffect(() => {
    if (authStatus !== "success" || !accessToken) return;

    dispatch(fetchBlockedUsers());
    dispatch(fetchTwitchGlobalBadges());
  }, [authStatus, accessToken]);

  useEffect(() => {
    if (
      authStatus !== "success" ||
      !accessToken ||
      !channelId ||
      !channelName
    ) {
      return;
    }

    if (fetchChannelStatus.badges.twitch === "idle") {
      dispatch(fetchTwitchChannelBadges({ channelId, channelName }));
    }
  }, [channelId, channelName, authStatus, accessToken]);

  // refetch twitch emote sets when channel changes
  useEffect(() => {
    if (!isJoined) return;

    dispatch(fetchAndMergeTwitchEmotes());
  }, [isJoined]);

  useEffect(() => {
    if (fetchGlobalStatus.emotes.bttv === "idle" && options.bttv.emotes) {
      dispatch(fetchBttvGlobalEmotes());
    }
    if (fetchGlobalStatus.badges.bttv === "idle" && options.bttv.badges) {
      dispatch(fetchBttvGlobalBadges());
    }
    if (fetchGlobalStatus.emotes.ffz === "idle" && options.ffz.emotes) {
      dispatch(fetchFfzGlobalEmotes());
    }
    if (fetchGlobalStatus.emotes.emoji === "idle" && options.ffz.emoji) {
      dispatch(fetchFfzEmoji());
    }
    if (fetchGlobalStatus.badges.ffz === "idle" && options.ffz.badges) {
      dispatch(fetchFfzGlobalBadges());
      dispatch(fetchFfzApGlobalBadges());
    }
    if (fetchGlobalStatus.emotes.stv === "idle" && options.stv.emotes) {
      dispatch(fetchStvGlobalEmotes());
    }
    // if (fetchGlobalStatus.badges.stv === "idle" && options.stv.badges) {
    //   dispatch(fetchStvGlobalBadges());
    // }
    if (
      fetchGlobalStatus.badges.chatterino === "idle" &&
      options.chatterino.badges
    ) {
      dispatch(fetchChatterinoGlobalBadges());
    }
  }, [
    options.bttv.emotes,
    options.bttv.badges,
    options.ffz.emotes,
    options.ffz.badges,
    options.stv.emotes,
    options.stv.badges,
    options.stv.badges,
    options.chatterino.badges,
  ]);

  useEffect(() => {
    if (!channelId || !channelName) return;

    const params = { channelId, channelName };

    if (fetchChannelStatus.emotes.bttv === "idle" && options.bttv.emotes) {
      dispatch(fetchBttvChannelEmotes(params));
    }
    if (fetchChannelStatus.emotes.ffz === "idle" && options.ffz.emotes) {
      dispatch(fetchFfzChannelEmotes(params));
    }
    if (fetchChannelStatus.emotes.stv === "idle" && options.stv.emotes) {
      dispatch(fetchStvChannelEmotes(params));
    }
  }, [
    channelId,
    channelName,
    options.bttv.emotes,
    options.ffz.emotes,
    options.stv.emotes,
    options.recentMessages.load,
    fetchChannelStatus.badges.twitch,
    fetchChannelStatus.emotes.bttv,
    fetchChannelStatus.emotes.ffz,
    fetchChannelStatus.emotes.stv,
  ]);

  useEffect(() => {
    if (channelNames.length === 0) return;
    for (const { name, status } of fetchRecentMessagesStatus) {
      if (status === "idle" && options.recentMessages.load) {
        dispatch(fetchRecentMessages(name));
      }
    }
  }, [channelNames.length, options.recentMessages.load]);

  useEffect(() => {
    if (isChannelReady) return;
    if (!isChannelResourcesLoaded) return;

    dispatch(channelResourcesLoaded());
  }, [isChannelReady, isChannelResourcesLoaded]);
};

export default useFetchChatData;
