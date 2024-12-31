import storageService from "@frontend/services/localStorageService";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import { currentChannelNameSelector } from "@frontend/store/slices/chat/selectors";
import {
  channelsInitialized,
  currentChannelChanged,
} from "@frontend/store/slices/chat/slice";
import { LocalStorageChannels } from "@frontend/store/slices/chat/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/*
Last Channel Priority
1. window location hash param
2. localStorage -> lastChannel
3. first channel in localStorage -> channels

If there is no such channel add it to the first position
*/
const initializeChannels = (): [
  initialChannels: LocalStorageChannels,
  initialCurrentChannel: string | undefined
] => {
  const channels =
    storageService.getSync<LocalStorageChannels>("channels") || [];

  const hashChannel = window.location.hash.slice(1);

  if (hashChannel) {
    if (!channels.some(([name]) => name === hashChannel)) {
      channels.unshift([hashChannel]);
    }
    return [channels, hashChannel];
  }

  const cachedChannel = storageService.getSync("lastChannel");

  if (cachedChannel) {
    if (!channels.some(([name]) => name === cachedChannel)) {
      channels.unshift([cachedChannel]);
    }
    return [channels, cachedChannel];
  }

  if (channels.length > 0) {
    return [channels, channels[0][0]];
  }

  return [channels, undefined];
};

const useInitializeTabs = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const channel = useAppSelector(currentChannelNameSelector);

  useEffect(() => {
    const [initialChannels, initialCurrentChannel] = initializeChannels();
    if (initialChannels.length === 0 || !initialCurrentChannel) return;
    dispatch(channelsInitialized(initialChannels));
    dispatch(currentChannelChanged(initialCurrentChannel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = channel ? `#${channel} - Honey Chat` : "Honey Chat";
    if (channel) {
      storageService.setSync("lastChannel", channel);
      router.push(`#${channel}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);
};

export default useInitializeTabs;
