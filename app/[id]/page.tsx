import axios from "axios";
import Link from "next/link";
import { notFound } from "next/navigation";

import View from "~/components/View";

import { getAccessToken } from "~/utils/oauth";

import { ArrowLeft } from "lucide-react";

import { i18nSSR } from "~/utils/i18n";

import { headers } from "next/headers";

import type { Pack } from "~/utils/types";

const fetchPack = async ({
  accessToken,
  packId,
}: {
  accessToken?: string;
  packId: string;
}) => {
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
};

const PackView = async ({ params }: { params: Promise<{ id: string }> }) => {
  const maintenance = process.env.MAINTENANCE === "1";

  if (maintenance) {
    return <div>Maintenance</div>;
  }

  const headersStore = await headers();

  const pack = await fetchPack({
    accessToken: await getAccessToken(),
    packId: (await params).id,
  });

  i18nSSR(headersStore.get("accept-language") ?? "");

  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col m-4 gap-8 w-full h-full">
          <div className="flex items-center gap-4 w-full">
            <Link href="/browse">
              <ArrowLeft className="w-[28px] h-[28px] cursor-pointer" />
            </Link>
          </div>
          <View pack={pack} />
        </div>
      </div>
    </div>
  );
};

export default PackView;
