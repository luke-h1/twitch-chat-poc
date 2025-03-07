import {
  AllBadges,
  MessageBadge,
  HtmlBadge,
  MessageBadgeType,
  FFZ_AP_HELPERS,
  FfzAp,
  FFZ_AP_COLORS,
} from "@frontend/types/badges/types";

const createHtmlBadge = (
  badges: AllBadges,
  [type, id, version]: MessageBadge
): HtmlBadge | null => {
  if (type === MessageBadgeType.TWITCH) {
    const badgeVersion =
      badges.twitchChannel?.[id]?.[version] ||
      badges.twitchGlobal?.[id]?.[version];
    if (!badgeVersion) return null;
    const {
      title,
      image_url_1x: x1,
      image_url_2x: x2,
      image_url_4x: x4,
    } = badgeVersion;
    const srcSet = `${x1} 1x, ${x2} 2x, ${x4} 4x`;
    return {
      id,
      title,
      alt: title,
      src: x1,
      srcSet,
    };
  }

  if (type === MessageBadgeType.BTTV) {
    const badge = badges.bttv?.entries[id];
    if (!badge) return null;
    const {
      badge: { description, svg },
    } = badge;
    return {
      id,
      title: description,
      alt: description,
      src: svg,
    };
  }

  if (type === MessageBadgeType.FFZ) {
    const badge = badges.ffz?.entries[id];
    if (!badge) return null;
    const { title, color, urls } = badge;
    const srcSet = `${urls["1"]} 1x, ${urls["2"]} 2x, ${urls["4"]} 4x`;
    return {
      id,
      title,
      alt: title,
      src: urls["1"],
      srcSet,
      bgColor: color,
    };
  }

  if (type === MessageBadgeType.FFZ_AP) {
    const badge = badges.ffzAp?.entries[id];
    const title = FFZ_AP_HELPERS[id] || FfzAp.Supporter;
    const x1 = `https://api.ffzap.com/v1/user/badge/${id}/1`;
    const x2 = `https://api.ffzap.com/v1/user/badge/${id}/2`;
    const x4 = `https://api.ffzap.com/v1/user/badge/${id}/3`;
    const srcSet = `${x1} 1x, ${x2} 2x, ${x4} 4x`;
    const color =
      badge?.badge_color ||
      FFZ_AP_COLORS[title] ||
      FFZ_AP_COLORS[FfzAp.Supporter];
    return {
      id,
      title,
      alt: title,
      src: x1,
      srcSet,
      bgColor: color,
    };
  }

  if (type === MessageBadgeType.STV) {
    const badge = badges.stv?.entries[id];
    if (!badge) return null;
    const { tooltip, urls } = badge;
    const [[, x1], [, x2], [, x3]] = urls;
    const srcSet = `${x1} 1x, ${x2} 2x, ${x3} 3x`;
    return {
      id,
      title: tooltip,
      alt: tooltip,
      src: x1,
      srcSet,
    };
  }

  if (type === MessageBadgeType.CHATTERINO) {
    const badge = badges.chatterino?.entries[id];
    if (!badge) return null;
    const { tooltip, image1, image2, image3 } = badge;
    const srcSet = `${image1} 1x, ${image2} 2x, ${image3} 3x`;
    return {
      id,
      title: tooltip,
      alt: tooltip,
      src: image1,
      srcSet,
    };
  }

  return null;
};

export default createHtmlBadge;
