import useAuth from "@frontend/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import { emotesSelector } from "@frontend/store/selectors/emote";
import { currentChannelNameSelector } from "@frontend/store/slices/chat/selectors";

export default function Chat() {
  const dispatch = useAppDispatch();

  const channel = useAppSelector(currentChannelNameSelector);
  const emotes = useAppSelector(emotesSelector);

  useAuth();

  return <div>chat</div>;
}
