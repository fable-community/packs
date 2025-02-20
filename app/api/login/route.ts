import { cookies } from "next/headers";

export async function POST(request: Request) {
  const url = new URL(
    request.url || "",
    `http://${(request.headers.get("host") as string) ?? "localhost"}`
  );

  const state = crypto.randomUUID();
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return new Response("Missing Discord Client ID ", {
      status: 500,
    });
  }

  const cookiesStore = await cookies();

  const query = new URLSearchParams({
    scope: "identify",
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${url.origin}/api/callback`,
    state,
  }).toString();

  cookiesStore.set("state", state);

  return Response.redirect(
    `https://discord.com/oauth2/authorize?${query}`,
    303
  );
}
