import useTwitchClient from "@frontend/hooks/useTwitchClient";
import storageService from "@frontend/services/localStorageService";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import {
  channelNamesSelector,
  currentChannelNameSelector,
} from "@frontend/store/slices/chat/selectors";
import {
  currentChannelChanged,
  channelRemoved,
  channelAdded,
  messageReceived,
} from "@frontend/store/slices/chat/slice";
import createCustomNotice from "@frontend/util/createCustomNotice";
import styles from "./ChatTabs.module.scss";

interface Props {
  chat: ReturnType<typeof useTwitchClient>;
}

export default function ChatTabs({ chat }: Props) {
  const dispatch = useAppDispatch();
  const channelNames = useAppSelector(channelNamesSelector);
  const currentChannelName = useAppSelector(currentChannelNameSelector);

  const handleTabClick = (name: string) => () => {
    dispatch(currentChannelChanged(name));
  };

  const handleCloseTab = (name: string) => () => {
    chat.current?.part(name);
    dispatch(channelRemoved(name));

    const lsChannels = storageService.getSync("channels") || [];

    storageService.setSync(
      "channels",
      lsChannels.filter(([n]) => n !== name)
    );
  };

  const handleAddTabClick = () => {
    const name = prompt("Enter channel name", "");
    if (!name) return;
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName || normalizedName.includes(" ")) return;

    chat.current
      ?.join(normalizedName)
      .catch((e) =>
        dispatch(messageReceived(createCustomNotice(normalizedName, e.message)))
      );

    dispatch(channelAdded(normalizedName));

    const lsChannels = storageService.getSync("channels") || [];

    lsChannels.push([name]);
    storageService.setSync("channels", lsChannels);
  };

  return (
    <div className={styles.root}>
      {channelNames.map((name, i) => (
        // eslint-disable-next-line react/jsx-key
        <div className={styles.tab} key={i}>
          <p className={styles.tabName} onClick={handleTabClick(name)}>
            {name}
          </p>
          <p onClick={handleCloseTab(name)}>Close</p>
        </div>
      ))}
      <div className={styles.tab}>
        <p className={styles.tabName} onClick={handleAddTabClick}>
          +
        </p>
      </div>
    </div>
  );
}
