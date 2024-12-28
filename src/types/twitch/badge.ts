import { components } from "../generated/twitch.generated";

export type TwitchBadgesResponse =
  components["schemas"]["GetGlobalChatBadgesResponse"];

export type TwitchBadgeVersion =
  components["schemas"]["ChatBadge"]["versions"][number];
