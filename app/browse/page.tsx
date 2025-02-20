import axios from "axios";
import NavBar from "~/components/NavBar";
import Avatar from "~/components/Avatar";
import Browse from "~/components/Browse";
import { DiscordButton } from "~/components/Login";
import { cookies, headers } from "next/headers";

import { fetchUser } from "~/utils/oauth";
import { i18nSSR } from "~/utils/i18n";

import type { PackWithCount } from "~/utils/types";

async function fetchPopularPacks() {
  const endpoint = process.env.API_ENDPOINT;

  let packs: PackWithCount[] = [];

  if (endpoint) {
    const response = await axios(`${endpoint}/popular?limit=10`);

    const { packs: fetchedPacks } = response.data as {
      packs: PackWithCount[];
      length: number;
      offset: number;
      limit: number;
    };

    packs = fetchedPacks.filter(({ servers }) => (servers ?? 0) >= 3);
  }

  return packs;
}

export default async function BrowsePage() {
  const maintenance = process.env.MAINTENANCE === "1";

  if (maintenance) {
    return <div>Maintenance</div>;
  }

  const cookieStore = await cookies();
  const headersStore = await headers();

  const { user } = await fetchUser(cookieStore);

  const popularPacks = await fetchPopularPacks();

  i18nSSR(headersStore.get("accept-language") ?? "");

  return (
    <div className="flex flex-col grow w-full my-[2rem] gap-[5vh]">
      <div className={"flex mx-[2rem] items-center"}>
        <NavBar active="browse" />
        {user ? (
          <Avatar id={user.id} avatar={user.avatar} />
        ) : (
          <DiscordButton className="h-[32px]" />
        )}
      </div>

      <Browse popularPacks={popularPacks} />
    </div>
  );
}
