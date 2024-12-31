import {
  ChatterinoBadge,
  ChatterinoBadgesResponse,
} from "@frontend/types/chatterino/badge";
import { Badge } from "@frontend/types/util";

// https://github.com/FrankerFaceZ/Add-Ons/blob/master/src/chatterino-badges/index.js
export const parseChatterinoBadges = ({
  badges,
}: ChatterinoBadgesResponse): Badge<ChatterinoBadge> => {
  const result: Badge<ChatterinoBadge> = { entries: {}, users: {} };

  let i = 0;

  for (const { users, ...badge } of badges) {
    result.entries[i] = badge;

    for (const userId of users) {
      if (!result.users[userId]) result.users[userId] = [];

      result.users[userId].push(i.toString());
    }

    i += 1;
  }

  return result;
};
