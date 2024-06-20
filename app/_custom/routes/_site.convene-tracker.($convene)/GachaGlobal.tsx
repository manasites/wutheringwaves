import { useState } from "react";

import type { SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";

import { Button } from "~/components/Button";
import { H2 } from "~/components/Headers";
import { Image } from "~/components/Image";

import { DatesChart } from "./DatesChart";
import { PitiesChart } from "./PitiesChart";
import type { loader } from "./route";

type WuwaFiltersType = {
   startDate?: string;
   endDate?: string;
   resourceId?: string;
};

export function GachaGlobal({
   summary,
}: {
   summary: SerializeFrom<typeof loader>["globalSummary"];
}) {
   const [filters, setFilters] = useState<WuwaFiltersType>({});

   if (!summary) return null;

   const pities = filters.resourceId
      ? summary.fiveStars[filters.resourceId]?.pities
      : summary.pities;

   const dates = filters.resourceId
      ? summary.fiveStars[filters.resourceId]?.dates
      : summary.dates;

   // display five star percentage in shape of #.##%
   const fiveStarPercentage = summary.fiveStar
      ? ((summary.fiveStar / summary.total) * 100).toFixed(2)
      : 0;
   const fourStarPercentage = summary.fourStar
      ? ((summary.fourStar / summary.total) * 100).toFixed(2)
      : 0;

   return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
         <div //two columns
            className="columns-2"
         >
            <div className="flex flex-col gap-y-1">
               <div className="flex gap-x-2">
                  <span>{summary.players.toLocaleString()}</span>
                  <span className="font-bold">Rovers logged</span>
               </div>
               <div className="flex gap-x-2">
                  <span>{summary.total.toLocaleString()}</span>
                  <span className="font-bold">Convenes rolled</span>
               </div>
               <div className="flex gap-x-2">
                  <span>{(summary.total * 160).toLocaleString()}</span>
                  <span className="font-bold">Gems used</span>
               </div>
               <div className="flex gap-x-2">
                  <span className="font-bold">5★ Convenes:</span>
                  <span>{summary.fiveStar}</span>
                  <span>({fiveStarPercentage}%)</span>
               </div>
               <div className="flex gap-x-2">
                  <span className="font-bold">4★ Convenes:</span>
                  <span>{summary.fourStar}</span>
                  <span>({fourStarPercentage}%)</span>
               </div>
            </div>
         </div>
         <DateFilters filters={filters} setFilters={setFilters} />
         {dates && <DatesChart dates={dates} filters={filters} />}
         <FiveStars
            fiveStars={summary.fiveStars}
            resourceId={filters.resourceId}
            onClick={(e) =>
               setFilters({ ...filters, resourceId: e.currentTarget.value })
            }
         />
         {pities && <PitiesChart pities={pities} />}
         {/* {pities && <LineandBarChart pities={pities} />} */}
      </div>
   );
}

// we'll hardcode the version dates for now
const versions = [
   { version: "v1.0", startDate: "2024-05-22", endDate: "2024-06-28" },
   { version: "v1.1", startDate: "2024-06-28", endDate: "2024-07-25" },
];

function DateFilters({
   filters,
   setFilters,
}: {
   filters: WuwaFiltersType;
   setFilters: (filters: WuwaFiltersType) => void;
}) {
   return (
      <div>
         {versions.map((v) => (
            <button
               key={v.version}
               className="relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] tablet:px-[calc(theme(spacing.3)-1px)] tablet:py-[calc(theme(spacing[1.5]))] tablet:text-tablet/6 focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 data-[disabled]:opacity-50 [&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:tablet:my-1 [&>[data-slot=icon]]:tablet:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText] border-zinc-950/10 text-zinc-950 data-[active]:bg-zinc-950/[2.5%] data-[hover]:bg-zinc-950/[2.5%] dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-[active]:bg-white/5 dark:data-[hover]:bg-white/5 [--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)] dark:data-[active]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.zinc.400)] cursor-pointer"
               onClick={() =>
                  setFilters({
                     ...filters,
                     startDate: v.startDate,
                     endDate: v.endDate,
                  })
               }
            >
               {v.version}
            </button>
         ))}
         Date Range:
         <input
            type="date"
            name="startDate"
            className="dark:text-zinc-100 px-1 dark:bg-dark400 bg-zinc-50  shadow-sm dark:shadow-zinc-800/70 border-zinc-200/70
      font-header  text-lg  rounded-l rounded-r-md overflow-hidden border shadow-zinc-50 dark:border-zinc-700 "
            value={filters.startDate}
            onChange={(e) =>
               setFilters({ ...filters, startDate: e.target.value })
            }
         />
         to
         <input
            type="date"
            name="endDate"
            className="dark:text-zinc-100 px-1 dark:bg-dark400 bg-zinc-50  shadow-sm dark:shadow-zinc-800/70 border-zinc-200/70
font-header  text-lg  rounded-l rounded-r-md overflow-hidden border shadow-zinc-50 dark:border-zinc-700 "
            value={filters.endDate}
            onChange={(e) =>
               setFilters({ ...filters, endDate: e.target.value })
            }
         />
      </div>
   );
}

// function getPities({
//    summary,
//    resourceId,
//    startDate,
//    endDate,
// }: {
//    summary: GlobalSummaryType;
//    resourceId: string | null;
//    startDate: string;
//    endDate: string;
// }) {
//    let pities: Record<string, number> = {};
//    let dates: Record<string, number> = {};
// }

function FiveStars({
   fiveStars,
   resourceId,
   onClick,
}: {
   fiveStars: Record<
      string,
      { pities: Record<string, number>; dates: Record<string, number> }
   >;
   resourceId?: string;
   onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
   return (
      <div className="flex flex-col gap-y-1">
         <div className="relative inline-block text-center align-middle">
            <div className="relative m-1 w-full rounded-md border p-2 dark:border-gray-700">
               {Object.entries(fiveStars)
                  .map(([id, { pities }]) => (
                     <WarpFrame
                        id={id}
                        key={id}
                        pities={pities}
                        resourceId={resourceId}
                        onClick={onClick}
                     />
                  ))
                  .reverse()}
            </div>
         </div>
      </div>
   );
}

function WarpFrame({
   id,
   resourceId,
   onClick,
   pities,
}: {
   id: string;
   resourceId?: string;
   onClick: React.MouseEventHandler<HTMLButtonElement>;
   pities: Record<string, number>;
}) {
   const { weapons, resonators } = useRouteLoaderData<typeof loader>(
      "_custom/routes/_site.convene-tracker.($convene)/route",
   )!;

   // sum of pities
   const total = Object.values(pities).reduce((a, b) => a + b, 0);

   let entry =
      weapons?.find((w) => w.id == id) ??
      resonators?.find((w) => w.id == id) ??
      null;

   // console.log({ resourceId, id });

   return entry ? (
      <button
         onClick={onClick}
         value={id}
         className={`relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] tablet:px-[calc(theme(spacing.3)-1px)] tablet:py-[calc(theme(spacing[1.5]))] tablet:text-tablet/6 focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 data-[disabled]:opacity-50 [&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:tablet:my-1 [&>[data-slot=icon]]:tablet:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText] border-zinc-950/10 text-zinc-950 data-[active]:bg-zinc-950/[2.5%] data-[hover]:bg-zinc-950/[2.5%] dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-[active]:bg-white/5 dark:data-[hover]:bg-white/5 [--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)] dark:data-[active]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.zinc.400)] cursor-pointer ${
            resourceId === id && "bg-orange-500/10"
         }`}
      >
         <ItemFrame entry={entry} total={total} />
      </button>
   ) : null;
}

function ItemFrame({ entry, total }: any) {
   // mat holds material information
   return (
      <div
         className="relative inline-block text-center align-middle"
         key={entry?.id}
      >
         <div className="relative mx-0.5 inline-block h-16 w-16 align-middle text-xs color-rarity-1">
            <Image
               url={entry?.icon?.url ?? "no_image_42df124128"}
               className={`object-contain color-rarity-${
                  `1`
                  // mat?.rarity?.display_number ?? "1"
               } material-frame`}
               alt={entry?.name}
            />
            <div className="absolute bottom-0 right-0 bg-white/50 text-black p-1 text-xs rounded-md ">
               x{total}
            </div>
         </div>
      </div>
   );
}
