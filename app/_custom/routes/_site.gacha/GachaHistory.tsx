import { useState } from "react";

import { Link, useLoaderData } from "@remix-run/react";

import { Image } from "~/components/Image";

import type { GachaSummary } from "./getSummary";
import type { loader, RollData } from "./route";

type GachaToggles = {
   fourStar: boolean;
   fiveStar: boolean;
   weapons: boolean;
   resonators: boolean;
};

export function GachaHistory({ summary }: { summary: GachaSummary }) {
   const [toggles, setToggles] = useState<GachaToggles>({
      fourStar: true,
      fiveStar: true,
      weapons: true,
      resonators: true,
   });

   const gacha = getGacha({ summary, toggles });

   console.log({ gacha });

   return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
         <h3 className="text-lg font-bold">Gacha History</h3>
         <div className="flex gap-x-2">
            <label>
               <input
                  type="checkbox"
                  checked={toggles.fourStar}
                  onChange={() =>
                     setToggles((t) => ({ ...t, fourStar: !t.fourStar }))
                  }
               />
               4*
            </label>
            <label>
               <input
                  type="checkbox"
                  checked={toggles.fiveStar}
                  onChange={() =>
                     setToggles((t) => ({ ...t, fiveStar: !t.fiveStar }))
                  }
               />
               5*
            </label>
            <label>
               <input
                  type="checkbox"
                  checked={toggles.resonators}
                  onChange={() =>
                     setToggles((t) => ({ ...t, resonators: !t.resonators }))
                  }
               />
               Resonators
            </label>
            <label>
               <input
                  type="checkbox"
                  checked={toggles.weapons}
                  onChange={() =>
                     setToggles((t) => ({ ...t, weapons: !t.weapons }))
                  }
               />
               Weapons
            </label>
         </div>
         {gacha?.map((roll, int) => (
            <ResultFrame roll={roll} key={roll.roll} />
         ))}
      </div>
   );
}

// return a RollData[] array based on the toggles from summary
function getGacha({
   summary,
   toggles,
}: {
   summary: GachaSummary;
   toggles: GachaToggles;
}) {
   let gacha: RollData[] = [];
   if (toggles.fourStar) gacha = gacha.concat(summary.fourStars);
   if (toggles.fiveStar) gacha = gacha.concat(summary.fiveStars);
   if (!toggles.resonators)
      gacha = gacha.filter((r) => r.resourceType !== "Resonators");
   if (!toggles.weapons)
      gacha = gacha.filter((r) => r.resourceType !== "Weapons");

   // sort gacha by roll number, most recent first
   gacha.sort((a, b) =>
      a.roll !== undefined && b.roll !== undefined ? b.roll - a.roll : 0,
   );
   return gacha;
}

function ResultFrame({ roll }: { roll: RollData }) {
   switch (roll.resourceType) {
      case "Weapons":
         return <WeaponFrame roll={roll} />;
      case "Resonators":
         return <ResonatorFrame roll={roll} />;
      default:
         return <div>Unknown Resource Type</div>;
   }
}

function WeaponFrame({ roll }: { roll: RollData }) {
   const { weapons } = useLoaderData<typeof loader>();

   const weapon = weapons?.find((w) => w.id == roll.resourceId);
   return (
      <Link to={`/c/weapons/${weapon?.slug}`}>
         <div
            className={`relative m-1 w-full rounded-md border p-2 dark:border-gray-700 ${customColor(
               weapon?.rarity?.id,
            )}`}
         >
            <div className="relative inline-block text-center align-middle">
               #{roll.roll}
            </div>
            <ItemFrame entry={weapon} />
            <div className="mx-1 inline-block align-middle">
               {weapon?.rarity?.id}*
            </div>
            <div className="mx-1 inline-block align-middle">{weapon?.name}</div>
            <div className="mx-1 inline-block align-right">${roll.pity}</div>
         </div>
      </Link>
   );
}

function ResonatorFrame({ roll }: { roll: RollData }) {
   const { resonators } = useLoaderData<typeof loader>();
   const resonator = resonators?.find((r) => r.id == roll.resourceId);
   return (
      <Link to={`/c/resonators/${resonator?.slug}`}>
         <div
            className={`flex m-1 w-full rounded-md border p-2 dark:border-gray-700 ${customColor(
               resonator?.rarity?.id,
            )}`}
         >
            <div className="relative inline-block text-center align-middle">
               #{roll.roll}
            </div>
            <ItemFrame entry={resonator} />
            <div className="mx-1 inline-block align-middle">
               {resonator?.rarity?.id}*
            </div>
            <div className="mx-1 inline-block align-middle">
               {resonator?.name}
            </div>
            <div className="mx-1 inline-block align-right">${roll.pity}</div>
         </div>
      </Link>
   );
}

function customColor(rarity?: string) {
   switch (rarity) {
      case "5":
         return "bg-orange-500 bg-opacity-10 font-bold";
      case "4":
         return "bg-purple-500 bg-opacity-10 font-bold";
      default:
         return "";
   }
}

function ItemFrame({ entry, type }: any) {
   // mat holds material information

   return (
      <div
         className="relative inline-block text-center align-middle"
         key={entry?.id}
      >
         <div className="relative mx-0.5 inline-block h-11 w-11 align-middle text-xs">
            <Image
               url={entry?.icon?.url ?? "no_image_42df124128"}
               className={`object-contain color-rarity-${
                  `1`
                  // mat?.rarity?.display_number ?? "1"
               } material-frame`}
               alt={entry?.name}
            />
         </div>
      </div>
   );
}
