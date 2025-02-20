"use client";

import { useEffect, useState } from "react";

import { ArrowUp, Calendar, Search } from "lucide-react";

import PackTile from "~/components/PackTile";

import { useDebounce } from "~/utils/useDebounce";

import type { PackWithCount } from "~/utils/types.ts";

// async function fetchPopularPacks() {
//   const response = await fetch(`/api/popular`, {
//     method: 'GET',
//   });

//   const { packs } = (await response.json()) as {
//     packs: PackWithCount[];
//   };

//   return packs;
// }

async function fetchLastUpdatedPacks() {
  const response = await fetch(`/api/updated`, {
    method: "GET",
  });

  const { packs } = (await response.json()) as {
    packs: PackWithCount[];
  };

  return packs;
}

async function searchPacks(q: string) {
  const response = await fetch(`/api/search?q=${q}`, {
    method: "GET",
  });

  const { packs } = (await response.json()) as {
    packs: PackWithCount[];
  };

  return packs;
}

const Browse = ({
  popularPacks: initialPopularPacks,
}: {
  popularPacks: PackWithCount[];
}) => {
  const [currTab, setCurrTab] = useState<"popular" | "updated">("popular");

  const [updatedPacks, setUpdatedPacks] = useState<PackWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularPacks] = useState<PackWithCount[]>(initialPopularPacks);

  const [debouncedQuery, query, setQuery] = useDebounce("", 300);

  useEffect(() => {
    if (debouncedQuery) return;

    // if (currTab === 'popular') {
    //   loading.value = true;
    //   fetchPopularPacks().then((packs) => {
    //     popularPacks.value = packs;
    //     loading.value = false;
    //   });
    // }

    if (currTab === "updated") {
      setLoading(true);
      fetchLastUpdatedPacks().then((packs) => {
        setUpdatedPacks(packs);
        setLoading(false);
      });
    }
  }, [currTab, debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery) return;

    setLoading(true);
    setCurrTab("updated");
    searchPacks(debouncedQuery).then((packs) => {
      setUpdatedPacks(packs);
      setLoading(false);
    });
  }, [debouncedQuery]);

  return (
    <div className={"flex grow justify-center bg-background mx-[2rem]"}>
      <div className={"flex flex-col items-center w-full max-w-[800px] gap-8"}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex w-full h-12 rounded-lg overflow-hidden">
            <div
              onClick={() => setCurrTab("popular")}
              className={`flex grow justify-center items-center gap-2 py-2 text-center font-bold cursor-pointer hover:bg-white hover:text-embed transition-colors ${
                currTab === "popular"
                  ? "bg-white text-embed pointer-events-none"
                  : "bg-embed"
              }`}
            >
              <ArrowUp className="w-5 h-5" />
              Popular
            </div>
            <div
              onClick={() => setCurrTab("updated")}
              className={`flex grow justify-center items-center gap-2 py-2 text-center font-bold cursor-pointer hover:bg-white hover:text-embed transition-colors ${
                currTab === "updated"
                  ? "bg-white text-embed pointer-events-none"
                  : "bg-embed"
              }`}
            >
              <Calendar className="w-5 h-5" />
              Recent
            </div>
          </div>

          <div className="flex w-full h-12 p-4 gap-4 rounded-lg bg-embed justify-center items-center overflow-hidden">
            <Search className="w-5 mx-4 h-5" />
            <input
              className="w-full"
              placeholder={"Search"}
              onInput={(ev) => setQuery((ev.target as HTMLInputElement).value)}
              value={query}
            ></input>
          </div>
        </div>

        {!loading && debouncedQuery ? (
          <span className="font-bold uppercase">
            {updatedPacks.length} Results Found
          </span>
        ) : undefined}

        {loading ? (
          <LoadingSpinner className="inline w-8 h-8 animate-spin text-grey fill-white" />
        ) : currTab === "popular" ? (
          popularPacks.map((pack, index) => (
            <PackTile key={index} pack={pack} index={index} />
          ))
        ) : (
          updatedPacks.map((pack, index) => (
            <PackTile key={index} pack={pack} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default Browse;

const LoadingSpinner = (props: { className: string }) => {
  return (
    <svg className={props.className} viewBox="0 0 100 101">
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  );
};
