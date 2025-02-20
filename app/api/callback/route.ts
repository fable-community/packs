import { cookies } from "next/headers";
import { COOKIE_BASE } from "~/utils/oauth";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function GET(request: Request) {
  const url = new URL(
    request.url || "",
    `http://${(request.headers.get("host") as string) ?? "localhost"}`
  );

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response("Missing Discord Client ID or Secret", {
      status: 500,
    });
  }

  const cookiesStore = await cookies();
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (code && state === cookiesStore.get("state")?.value) {
    await getAndStoreNewToken(
      cookiesStore,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: `${url.origin}/api/callback`,
        code,
      })
    );

    // Delete state cookie
    cookiesStore.delete("state");
  }

  return Response.redirect(new URL("/dashboard", request.url), 303);
}

async function getAndStoreNewToken(
  cookiesStore: ReadonlyRequestCookies,
  params: URLSearchParams
) {
  const response = await fetch("https://discord.com/api/oauth2/token", {
    body: params,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (await response.json()) as any;

  if (response.status === 200 && "access_token" in token) {
    cookiesStore.set("accessToken", token.access_token, {
      ...COOKIE_BASE,
      maxAge: token.expires_in,
    });

    cookiesStore.set("refreshToken", token.refresh_token, {
      ...COOKIE_BASE,
      maxAge: 31_536_000, // one year
    });

    return token.access_token as string;
  }
}
