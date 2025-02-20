/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { SiDiscord } from "@icons-pack/react-simple-icons";

import { i18n } from "~/utils/i18n";

export const DiscordButton = ({ className }: { className?: string }) => {
  return (
    <form method={"post"} action={"/api/login"}>
      <button className={`bg-discord flex gap-2 ${className}`} type={"submit"}>
        {i18n("loginWithDiscord")}
        <SiDiscord className={"w-[16px] h-auto"} />
      </button>
    </form>
  );
};

const Login = () => {
  return (
    <div className={"flex grow items-center justify-center"}>
      <div
        className={
          "bg-embed flex relative items-center justify-center rounded-[10px] px-[3.5rem] h-[60vh]"
        }
      >
        <img
          src={"/icon.png"}
          className={"absolute w-[32px] h-auto top-[2rem]"}
        />
        <DiscordButton />
      </div>
    </div>
  );
};

export default Login;
