import type { PackWithCount } from "~/utils/types";

export async function GET(request: Request) {
  let packs: PackWithCount[] = [];

  const { searchParams } = new URL(
    request.url || "",
    `http://${(request.headers.get("host") as string) ?? "localhost"}`
  );

  const q = searchParams.get("q");

  const endpoint = process.env.API_ENDPOINT;

  if (endpoint && (q?.length ?? 0 > 0)) {
    const response = await fetch(`${endpoint}/search?q=${q}&limit=10`, {
      method: "GET",
    });

    const { packs: fetchedPacks } = (await response.json()) as {
      packs: PackWithCount[];
      length: number;
      offset: number;
      limit: number;
    };

    packs = fetchedPacks;
  }

  return new Response(JSON.stringify({ packs }), {
    headers: { "Content-Type": "application/json" },
  });
}
