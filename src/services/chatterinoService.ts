import { ChatterinoBadgesResponse } from "@frontend/types/chatterino/badge";
import { chatterinoApi } from "./api";

const chatterinoService = {
  listGlobalBadges: async (): Promise<ChatterinoBadgesResponse> => {
    const { data } = await chatterinoApi.get<ChatterinoBadgesResponse>(
      "/badges"
    );
    return data;
  },
} as const;

export default chatterinoService;
