import type { User } from "~/utils/types.ts";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

export const COOKIE_BASE = {
  secure: process.env.NODE_ENV === "production",
  path: "/",
  httpOnly: true,
  sameSite: "lax",
} as const;

export const getAccessToken = async () => {
  const cookiesStore = await cookies();
  return cookiesStore.get("accessToken")?.value;
};

export async function fetchUser(cookies: ReadonlyRequestCookies): Promise<{
  user?: User;
  accessToken?: string;
}> {
  let user: User | undefined = undefined;

  let accessToken = cookies.get("accessToken")?.value;
  const refreshToken = cookies.get("refreshToken")?.value;

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!accessToken && refreshToken && clientId && clientSecret) {
    try {
      const tokenResponse = await fetch(
        "https://discord.com/api/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        }
      );

      if (!tokenResponse.ok) {
        console.error(
          "Failed to refresh token:",
          tokenResponse.status,
          await tokenResponse.text()
        );
        return {};
      }

      const tokenData = await tokenResponse.json();

      if (tokenData && tokenData.access_token) {
        accessToken = tokenData.access_token;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return {};
    }
  }

  if (accessToken) {
    try {
      const response = await fetch("https://discord.com/api/users/@me", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok && response.status === 200) {
        user = (await response.json()) as User;
      } else {
        console.warn(
          "Failed to fetch user:",
          response.status,
          await response.text()
        );
        // clean up invalid access tokens - handled by clearing cookies on the client side
        return {};
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return {};
    }
  }

  return {
    user,
    accessToken,
  };
}
