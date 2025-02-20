import Notice from "~/components/Notice";
import Dialog from "~/components/Dialog";

import { ClipboardCopy } from "lucide-react";

import { i18n } from "~/utils/i18n";

const HowToInstallDialog = ({
  packId,
  visible,
}: {
  packId?: string;
  visible: boolean;
}) => {
  return (
    <Dialog
      name={"success"}
      className={
        "flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none"
      }
      visible={Boolean(packId && visible)}
    >
      <div
        className={
          "bg-embed2 flex flex-col overflow-x-hidden overflow-y-auto rounded-xl m-4 p-8 gap-4 h-[60vh] w-[60vw] max-w-[500px] pointer-events-auto"
        }
      >
        <label className={"text-base font-bold"}>{i18n("successTitle")}</label>
        <label>{i18n("successSubtitle")}</label>

        <div
          className={"bg-highlight flex items-center p-4 rounded-xl"}
          data-clipboard={`/packs install id: ${packId}`}
        >
          <i className={"italic grow select-all"}>
            {`/packs install id: ${packId}`}
          </i>
          <ClipboardCopy className={"w-[18px] h-[18px] cursor-pointer"} />
        </div>
        <Notice type={"info"}>
          {i18n("successYouNeed")}
          <strong>{i18n("successManageServer")}</strong>
          {i18n("successPermissionToInstall")}
        </Notice>
        <button data-dialog-cancel={"success"}>{i18n("okay")}</button>
      </div>
    </Dialog>
  );
};

export default HowToInstallDialog;
