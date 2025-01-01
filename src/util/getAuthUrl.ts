const TWITCH_AUTH_BASE_URL = "https://id.twitch.tv/oauth2/authorize";

const AUTH_PARAMS = {
  client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string,
  redirect_uri: "TODO",
  response_type: "token+id_token",
  scope: [
    "openid",
    "chat:edit",
    "chat:read",
    "channel:moderate",
    "user:read:blocked_users",
    "user:manage:blocked_users",
    "user:manage:chat_color",
    "moderator:read:chat_settings",
    "moderator:manage:chat_settings",
    "moderator:manage:announcements",
    "moderator:manage:chat_messages",
  ].join("+"),
  claims: JSON.stringify({
    id_token: { email_verified: null, picture: null, preferred_username: null },
  }),
};

export default function getAuthUrl() {
  const queryParams = Object.entries(AUTH_PARAMS)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return `${TWITCH_AUTH_BASE_URL}?${queryParams}`;
}
