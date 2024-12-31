"use client";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch, useAppSelector } from "@frontend/store/hooks";
import { authStatusSelector } from "@frontend/store/slices/chat/selectors";
import storageService from "@frontend/services/localStorageService";
import { authStatusChanged } from "@frontend/store/slices/chat/slice";
import { JwtPayload } from "@frontend/types/twitch/user";
import twitchService from "@frontend/services/twitchService";

const useAuth = () => {
  const dispatch = useAppDispatch();
  const meAuthStatus = useAppSelector(authStatusSelector);

  useEffect(() => {
    if (meAuthStatus !== "uninitialized") return;

    let idToken: string | null | undefined;
    let accessToken: string | null | undefined;

    if (window.location.hash.startsWith("#access_token=")) {
      const params = new URLSearchParams(window.location.hash.slice(1));

      idToken = params.get("id_token");
      accessToken = params.get("access_token");

      if (accessToken && idToken) {
        storageService.setSync("tokens", { accessToken, idToken });
      }

      window.location.hash = "";
    } else {
      const tokens = storageService.getSync<{
        accessToken: string;
        idToken: string;
      }>("tokens");
      accessToken = tokens?.accessToken;
      idToken = tokens?.idToken;
    }

    if (!idToken || !accessToken) {
      dispatch(authStatusChanged({ authStatus: "error" }));
      return;
    }

    const user = storageService.getSync("user");

    if (user) {
      dispatch(
        authStatusChanged({ authStatus: "success", accessToken, ...user })
      );
      return;
    }

    const jwtData = jwtDecode<JwtPayload>(idToken);

    if (!jwtData) {
      dispatch(authStatusChanged({ authStatus: "error" }));
      return;
    }

    dispatch(
      authStatusChanged({
        authStatus: "success",
        accessToken,
        id: jwtData.sub,
        displayName: jwtData.preferred_username,
        picture: jwtData.picture,
      })
    );

    (async () => {
      let result: Awaited<ReturnType<typeof twitchService.listUsers>>;

      try {
        result = await twitchService.listUsers(
          [{ id: jwtData.sub }],
          accessToken
        );
      } catch (e) {
        dispatch(authStatusChanged({ authStatus: "error" }));
        return;
      }

      const twitchUser = result.data[0];
      const user = {
        id: twitchUser.id,
        login: twitchUser.login,
        displayName: twitchUser.display_name,
        picture: twitchUser.profile_image_url,
      };

      dispatch(
        authStatusChanged({ authStatus: "success", accessToken, ...user })
      );
      storageService.setSync("user", user);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meAuthStatus]);
};

export default useAuth;
