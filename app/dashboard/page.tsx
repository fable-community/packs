import axios from "axios";
import Link from "next/link";

import { cookies, headers } from "next/headers";

import { fetchUser } from "~/utils/oauth";

import Card from "~/components/Card";
import Avatar from "~/components/Avatar";
import NavBar from "~/components/NavBar";
import Login from "~/components/Login";

import { i18nSSR } from "~/utils/i18n";
import { Plus } from "lucide-react";

import type { Pack } from "~/utils/types";

async function getDashboardData(accessToken: string) {
  const endpoint = process.env.API_ENDPOINT;

  if (endpoint) {
    const response = await axios(`${endpoint}/user?limit=100`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    const { packs } = response.data;

    return packs as Pack[];
  }
  return [];
}

export default async function Dashboard() {
  const maintenance = process.env.MAINTENANCE === "1";

  if (maintenance) {
    return <div>Maintenance</div>;
  }

  const cookieStore = await cookies();
  const headersList = await headers();

  const { user, accessToken } = await fetchUser(cookieStore);

  if (!user || !accessToken) {
    return <Login />;
  }

  i18nSSR(headersList.get("Accept-Language") ?? "");

  const packs = await getDashboardData(accessToken);

  return (
    <div className="flex flex-col w-full bg-background grow my-[2rem] gap-[5vh]">
      <div className="flex mx-[2rem] items-center">
        <NavBar active="create" />
        <Avatar id={user.id} avatar={user.avatar} />
      </div>

      <div className="flex grow justify-center items-center mx-[2rem]">
        <div className="flex flex-wrap justify-center w-full max-w-[800px] gap-8">
          {packs.map((pack) => (
            <Card key={pack.manifest.id} pack={pack} />
          ))}

          <Link
            href="/new"
            className="flex items-center justify-center w-[128px] min-h-[32px] rounded-xl border-2 px-[16px] py-[24px] border-dashed border-grey hover:translate-y-[-8px] transition-all duration-150"
          >
            <Plus className="w-[32px] h-auto text-grey" />
          </Link>
        </div>
      </div>
    </div>
  );
}
