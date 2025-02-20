import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function App() {
  const cookiesStore = await cookies();
  if (cookiesStore.has("accessToken")) return redirect("/dashboard");
  redirect("/browse");
}
