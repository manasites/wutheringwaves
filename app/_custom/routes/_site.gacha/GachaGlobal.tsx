import type { SerializeFrom } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { H2 } from "~/components/Headers";
import { Image } from "~/components/Image";

import type { GlobalSummaryType } from "./addToGlobal";
import type { loader, RollData } from "./route";

export function GachaGlobal({
   summary,
}: {
   summary: SerializeFrom<typeof loader>["globalSummary"];
}) {
   if (!summary) return null;
   return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
         <div className="flex flex-col gap-y-1">
            <H2 text={summary?.convene?.name + " Global Stats"} />
         </div>
         <div //two columns
            className="columns-2"
         >
            <div className="flex flex-col gap-y-1"></div>
            <div className="flex flex-col gap-y-1">
               <div className="flex gap-x-2">
                  <span className="font-bold">Convenes Total:</span>
                  <span>{summary.total}</span>
               </div>
               <div className="flex gap-x-2">
                  <span className="font-bold">Worth:</span>
                  <span>{summary.total * 160}</span>
               </div>
               <div className="flex gap-x-2">
                  <span className="font-bold">Players:</span>
                  <span>{summary.players}</span>
               </div>
               <div className="flex gap-x-2">
                  <span className="font-bold">Resonators:</span>
                  <span>{summary.resonators}</span>
               </div>
               <div className="flex gap-x-2">
                  <span className="font-bold">Weapons:</span>
                  <span>{summary.weapons}</span>
               </div>
            </div>
         </div>
      </div>
   );
}

function WarpFrame({ roll }: { roll: RollData }) {
   const { weapons, resonators } = useLoaderData<typeof loader>();

   let entry: any;

   switch (roll.resourceType) {
      case "Weapons":
         entry = weapons?.find((w) => w.id == roll.resourceId);
         return (
            <Link to={`/c/weapons/${entry?.slug}`}>
               <ItemFrame entry={entry} roll={roll} />
            </Link>
         );
      case "Resonators":
         entry = resonators?.find((w) => w.id == roll.resourceId);
         return (
            <Link to={`/c/resonators/${entry?.slug}`}>
               <ItemFrame entry={entry} roll={roll} />
            </Link>
         );
      default:
         return <div>Unknown Resource Type</div>;
   }
}

function ItemFrame({ entry, roll }: any) {
   // mat holds material information
   return (
      <div
         className="relative inline-block text-center align-middle"
         key={entry?.id}
      >
         <div className="relative mx-0.5 inline-block h-16 w-16 align-middle text-xs">
            <Image
               url={entry?.icon?.url ?? "no_image_42df124128"}
               className={`object-contain color-rarity-${
                  `1`
                  // mat?.rarity?.display_number ?? "1"
               } material-frame`}
               alt={entry?.name}
            />
            <div className="absolute top-0 right-0 bg-white/50 text-black p-1 text-xs rounded-md ">
               {roll.pity}
            </div>
         </div>
      </div>
   );
}
