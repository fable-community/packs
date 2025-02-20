import { cookies, headers } from "next/headers";

import { fetchUser } from "~/utils/oauth";
import { i18nSSR } from "~/utils/i18n";

import Login from "~/components/Login";
import New from "~/components/New";

export default async function NewPage() {
  const maintenance = process.env.MAINTENANCE === "1";

  if (maintenance) {
    return <div>Maintenance</div>;
  }

  const cookiesStore = await cookies();
  const headersStore = await headers();

  const { user } = await fetchUser(cookiesStore);

  if (!user) {
    return <Login />;
  }

  i18nSSR(headersStore.get("accept-language") ?? "");

  return <New user={user} />;
}
