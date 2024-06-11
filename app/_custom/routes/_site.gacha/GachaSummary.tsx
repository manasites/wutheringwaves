import type { SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Image } from "~/components/Image";
import type { ConveneType } from "~/db/payload-custom-types";

import { PieChart } from "./Pie";
import type { loader, RollData } from "./route";

export function GachaSummary() {
   const loaderData = useLoaderData<typeof loader>();

   const summary = getSummary(loaderData);

   // set average pity rate as fiveStarPity, which is average of roll.pity in summary.fiveStars
   const fiveStarPity = Math.floor(
      summary.fiveStars.reduce(
         (acc: number, curr: RollData) => acc + (curr.pity ?? 80),
         0,
      ) / summary.fiveStars.length || 80,
   );

   // set average pity rate as fourStarPity, which is average of roll.pity in summary.fourStars
   const fourStarPity = Math.floor(
      summary.fourStars.reduce(
         (acc: number, curr: RollData) => acc + (curr.pity ?? 10),
         0,
      ) / summary.fourStars.length || 10,
   );

   console.log(summary);

   return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
         <h3 className="text-lg font-bold">Gacha Summary</h3>
         <div //two columns
            className="columns-2"
         >
            <div className="flex flex-col gap-y-2">
               <div className="flex flex-col gap-y-1">
                  <div className="flex gap-x-2">
                     <span className="font-bold">Gacha Name:</span>
                     <span>{loaderData?.convene?.name}</span>
                  </div>
               </div>
               <div className="flex flex-col gap-y-1">
                  <div className="flex gap-x-2">
                     <span className="font-bold">Total Pulls:</span>
                     <span>{summary.totalPulls}</span>
                  </div>
                  <div className="flex gap-x-2">
                     <span className="font-bold">Resonators:</span>
                     <span>{summary.resonators}</span>
                  </div>
                  <div className="flex gap-x-2">
                     <span className="font-bold">Weapons:</span>
                     <span>{summary.weapons}</span>
                  </div>
                  <div className="flex gap-x-2">
                     <span className="font-bold">5* Convenes:</span>
                     <span>{summary.fiveStars.length}</span>
                  </div>
                  <div className="flex gap-x-2">
                     <span className="font-bold">4* Convenes:</span>
                     <span>{summary.fourStars.length}</span>
                  </div>
                  <div className="flex gap-x-2">
                     <span className="font-bold">Avg 5* Pity:</span>
                     <span>{fiveStarPity}</span>
                  </div>
                  <div className="flex gap-x-2">
                     <span className="font-bold">Avg 4* Pity:</span>
                     <span>{fourStarPity}</span>
                  </div>
               </div>
               <div className="flex flex-col gap-y-1">
                  <PieChart
                     data={{
                        "3*":
                           summary.totalPulls -
                           summary.fiveStars.length -
                           summary.fourStars.length,
                        "4*": summary.fourStars.length,
                        "5*": summary.fiveStars.length,
                     }}
                     title="Rarity"
                  />
               </div>
            </div>
         </div>
         <FiveStarWarps summary={summary} />
      </div>
   );
}

function FiveStarWarps({ summary }: { summary: Summary }) {
   return (
      <div className="flex flex-col gap-y-1">
         <div className="relative inline-block text-center align-middle">
            <h2 className="font-bold">5* Warps:</h2>
            <div className="relative m-1 w-full rounded-md border p-2 dark:border-gray-700">
               {summary.fiveStars
                  .map((roll) => <WarpFrame roll={roll} key={roll.roll} />)
                  .reverse()}
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
         return <ItemFrame entry={entry} roll={roll} />;
      case "Resonators":
         entry = resonators?.find((w) => w.id == roll.resourceId);
         return <ItemFrame entry={entry} roll={roll} />;
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
            <div className="absolute bottom-0 right-0 bg-white/50 text-black p-1 text-xs rounded-md ">
               #{roll.pity}
            </div>
         </div>
      </div>
   );
}

type Summary = {
   convene?: ConveneType;
   totalPulls: number;
   resonators: number;
   weapons: number;
   fiveStars: RollData[];
   fourStars: RollData[];
};

function getSummary({ gacha, convene }: SerializeFrom<typeof loader>) {
   const summary = {
      convene,
      totalPulls: gacha?.data.length ?? 0,
      resonators: 0,
      weapons: 0,
      fiveStars: [] as Array<RollData>,
      fourStars: [] as Array<RollData>,
   };

   // use a for loop instead of forEach, work backwards from the last element in gacha.data
   let pity4 = 0; // 4* pity counter
   let pity5 = 0; // 5* pity counter

   for (let i = 1; i <= gacha.data.length; i++) {
      const roll = gacha.data[gacha.data.length - i];
      switch (roll?.resourceType) {
         case "Resonators":
            summary.resonators++;
            break;
         case "Weapons":
            summary.weapons++;
            break;
         default:
            console.log(i, "Unknown Resource Type: ", roll);
            break;
      }

      switch (roll?.qualityLevel) {
         case 5:
            summary.fiveStars.push({
               roll: i,
               pity: pity5,
               ...roll,
            });
            pity5 = 0;
            pity4 = 0;
            break;
         case 4:
            summary.fourStars.push({
               roll: i,
               pity: pity4,
               ...roll,
            });
            pity4 = 0;
            break;
         default:
            pity5++;
            pity4++;
            break;
      }
   }

   console.log({ summary });

   return summary;
}
