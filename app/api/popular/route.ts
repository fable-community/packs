import type { PackWithCount } from "~/utils/types";

export async function GET() {
  let packs: PackWithCount[] = [];

  const endpoint = process.env.API_ENDPOINT;

  if (endpoint) {
    const response = await fetch(`${endpoint}/popular?limit=10`, {
      method: "GET",
    });

    const { packs: fetchedPacks } = (await response.json()) as {
      packs: PackWithCount[];
      length: number;
      offset: number;
      limit: number;
    };

    packs = fetchedPacks.filter(({ servers }) => (servers ?? 0) >= 3);
  }

  return new Response(JSON.stringify({ packs }), {
    headers: { "Content-Type": "application/json" },
  });
}
