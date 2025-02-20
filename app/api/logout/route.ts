import { cookies } from "next/headers";

export async function POST(request: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response("Missing Discord Client ID or Secret", {
      status: 500,
    });
  }

  const cookiesStore = await cookies();

  // Revoke access token
  if (cookiesStore.has("accessToken")) {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      token: cookiesStore.get("accessToken")?.value as string,
    });

    await fetch("https://discord.com/api/oauth2/token/revoke", {
      body,
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  }

  // Clear cookies
  cookiesStore.delete("accessToken");
  cookiesStore.delete("refreshToken");

  return Response.redirect(new URL("/", request.url), 303);
}
