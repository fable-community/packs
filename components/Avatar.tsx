/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import Dialog from "~/components/Dialog";

import { LogOut } from "lucide-react";

import { i18n } from "~/utils/i18n";

const Avatar = ({ id, avatar }: { id: string; avatar?: string }) => {
  return (
    <>
      <img
        data-dialog={"logout"}
        className={
          "justify-self-end w-[32px] h-[32px] rounded-full cursor-pointer"
        }
        src={`https://cdn.discordapp.com/${
          id && avatar ? `avatars/${id}/${avatar}.png` : "embed/avatars/0.png"
        }`}
      />

      <Dialog name={"logout"} className={"top-[2rem] right-[4.5rem]"}>
        <form method={"post"} action={"/api/logout"}>
          <button type={"submit"} className={"bg-red flex items-center gap-2"}>
            {i18n("logout")}
            <LogOut className={"w-[24px] h-auto"} />
          </button>
        </form>
      </Dialog>
    </>
  );
};

export default Avatar;
