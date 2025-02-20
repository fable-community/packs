import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { fetchUser } from "~/utils/oauth";
import { i18nSSR } from "~/utils/i18n";
import type { Pack } from "~/utils/types";

import Login from "~/components/Login";
import Manage from "~/components/Manage";
import axios from "axios";

async function getData({
  accessToken,
  packId,
}: {
  accessToken?: string;
  packId: string;
}) {
  const endpoint = process.env.API_ENDPOINT;

  if (!endpoint || !packId) {
    notFound();
  }

  const response = await axios(`${endpoint}/pack/${packId}`, {
    method: "GET",
    headers: accessToken
      ? { authorization: `Bearer ${accessToken}` }
      : undefined,
  });

  const pack = response.data as Pack;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = (pack as any).error;

  if (err === "NOT_FOUND" || err === "Forbidden") {
    notFound();
  }

  if (err || !pack || !pack.manifest) {
    console.error(err);
    throw new Error(err);
  }

  return pack;
}

const PackEdit = async ({ params }: { params: Promise<{ id: string }> }) => {
  const maintenance = process.env.MAINTENANCE === "1";

  if (maintenance) {
    return <div>Maintenance</div>;
  }

  const cookiesStore = await cookies();
  const headersStore = await headers();

  const { user, accessToken } = await fetchUser(cookiesStore);

  if (!user || !accessToken) {
    return <Login />;
  }

  const pack = await getData({
    accessToken,
    packId: (await params).id,
  });

  i18nSSR(headersStore.get("accept-language") ?? "");

  return <Manage user={user} pack={pack} />;
};

export default PackEdit;
