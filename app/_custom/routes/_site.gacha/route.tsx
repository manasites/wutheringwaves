// Track Achievements using Local Storage on this page!
// Note all achievements and subcategories / total roll currency rewards will be included if possible.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
   Form,
   useActionData,
   useLoaderData,
   useSearchParams,
} from "@remix-run/react";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { z } from "zod";

import type {
   ConveneType,
   Resonator,
   Weapon,
} from "payload/generated-custom-types";
import { H2 } from "~/components/Headers";
import { fetchWithCache } from "~/utils/cache.server";

import {
   addGlobalSummary,
   type GlobalSummaryType,
   subGlobalSummary,
   toGlobal,
} from "./addToGlobal";
import { GachaGlobal } from "./GachaGlobal";
import { GachaHistory } from "./GachaHistory";
import { GachaSummary } from "./GachaSummary";
import { type GachaSummaryType, getSummary } from "./getSummary";
import { err } from "node_modules/inngest/types";
import { zx } from "zodix";

export type RollData = {
   pity?: number;
   cardPoolType: string;
   resourceId: string;
   qualityLevel: number;
   resourceType: string;
   name: string;
   count: number;
   time: string;
};

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderFunctionArgs) {
   const resonators = (
      await fetchWithCache<{ docs: Array<Resonator> }>(
         "http://localhost:4000/api/resonators?limit=1000&sort=id&depth=2)",
      )
   )?.docs;

   const weapons = (
      await fetchWithCache<{ docs: Array<Weapon> }>(
         "http://localhost:4000/api/weapons?limit=1000&sort=id&depth=2",
      )
   )?.docs;

   const conveneTypes = (
      await fetchWithCache<{ docs: Array<ConveneType> }>(
         "http://localhost:4000/api/convene-types?limit=1000&sort=id&depth=2",
      )
   )?.docs;

   const { searchParams } = new URL(request.url);

   const convene = searchParams.get("convene") || "1";

   // we'll avoid access control for global summary
   async function fetchSummary<T>(id: string) {
      try {
         return (
            await payload.findByID({
               collection: "user-data",
               id,
               overrideAccess: true,
            })
         ).data as T;
      } catch (e) {
         console.error(e);
         return null;
      }
   }

   const globalSummary = await fetchSummary<GlobalSummaryType>(
      "wuwa-convene-" + convene,
   );

   // this should be playerId from either cookie wuwa-url or wuwa-user;
   const playerId = searchParams.get("playerId") || "500016561";

   const playerSummary = await fetchSummary<GachaSummaryType>(
      "wuwa-" + playerId + "-" + convene,
   );

   return json({
      resonators,
      weapons,
      conveneTypes,
      convene: conveneTypes?.find((c) => c.id === convene),
      globalSummary,
      playerSummary,
      wuwaURL,
   });
}

export default function HomePage() {
   const [searchParams] = useSearchParams();
   const loaderData = useLoaderData<typeof loader>();
   const actionData = useActionData<typeof clientAction>();

   console.log(actionData);

   const playerSummary = actionData?.playerSummary ?? loaderData.playerSummary;

   return (
      <div className="mx-auto max-w-[728px] max-laptop:p-3 laptop:pb-20">
         <H2 text="Warp History" />
         <div className="justify-left flex items-center gap-x-1">
            <Form method="POST">
               <label htmlFor="url">Import URL</label>
               <input
                  name="url"
                  placeholder=""
                  type="url"
                  className="w-full"
                  required
               />
               <select
                  className="my-2 inline-flex rounded-sm border p-2 dark:bg-neutral-800"
                  name="convene"
                  onChange={(e) => e.currentTarget.form?.submit()}
                  defaultValue={searchParams.get("convene") ?? "1"}
                  required
               >
                  {loaderData?.conveneTypes?.map((convene) => (
                     <option key={convene.id} value={convene.id}>
                        {convene.name}
                     </option>
                  ))}
               </select>
               <input type="submit" value="Import" />
               <input type="checkbox" name="global" defaultChecked={true} />
               <label htmlFor="global">Global</label>
            </Form>
         </div>
         <div className="flex flex-col gap-y-1">
            <H2 text={loaderData.convene?.name ?? "Convene"} />
         </div>
         {loaderData.globalSummary && (
            <GachaGlobal summary={loaderData.globalSummary} />
         )}
         {playerSummary && <GachaSummary summary={playerSummary} />}
         {playerSummary && <GachaHistory summary={playerSummary} />}
      </div>
   );
}

const WuwaPayloadSchema = z.object({
   playerId: z.string(),
   serverId: z.string(),
   languageCode: z.string(),
   cardPoolType: z.string(),
   recordId: z.string(),
});

// we'll fetch the data on the client side then save it to the server
export async function clientAction({ request }: ClientActionFunctionArgs) {
   const { url, convene, global } = zx.parseQuery(
      request,
      {
         url: z.string(),
         convene: z.string(),
         global: z.boolean(),
      },
      { message: "Missing required parameters", status: 400 },
   );

   try {
      const searchParams = new URLSearchParams(url?.split("?")?.[1]);

      const wuwaPayload = WuwaPayloadSchema.parse({
         playerId: searchParams.get("player_id"),
         serverId: searchParams.get("svr_id"),
         languageCode: searchParams.get("lang"),
         cardPoolType: convene,
         recordId: searchParams.get("record_id"),
      });

      const response = await fetch(
         "https://gmserver-api.aki-game2.net/gacha/record/query",
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(wuwaPayload),
         },
      );

      const gacha = (await await response.json()) as { data: Array<RollData> };

      const playerSummary = getSummary(gacha, convene);

      return { gacha, playerSummary };
   } catch (e) {
      console.error(e);
      return { error: e };
   }
}

// todo: currently we're skipping access controls
export async function action({
   request,
   context: { user, payload },
}: ActionFunctionArgs) {
   const { base_payload, summary } = JSON.parse(await request.text()) as {
      base_payload: any;
      summary: GachaSummaryType;
   };

   console.log({ base_payload, summary });

   const id =
      "wuwa-" + base_payload?.playerId + "-" + base_payload?.cardPoolType;

   const globalId = "wuwa-convene-" + base_payload?.cardPoolType;

   let oldPlayerSummary: GachaSummaryType | undefined = undefined,
      oldGlobalSummary: GlobalSummaryType | undefined = undefined;

   try {
      oldPlayerSummary = (
         await payload.findByID({
            collection: "user-data",
            id,
            overrideAccess: true,
         })
      )?.data as GachaSummaryType;

      oldGlobalSummary = (
         await payload.findByID({
            collection: "user-data",
            id: globalId,
            overrideAccess: true,
         })
      )?.data as GlobalSummaryType;
   } catch (e) {
      console.error(e);
   }

   // First we compare the old and new player record
   const addToGlobal = oldPlayerSummary
      ? subGlobalSummary(toGlobal(summary), toGlobal(oldPlayerSummary))
      : toGlobal(summary);

   // Then we calculate the new global summary
   const newGlobalSummary = oldGlobalSummary
      ? addGlobalSummary(oldGlobalSummary, addToGlobal)
      : addToGlobal;

   try {
      // First we'll update the user record with the new summary
      if (oldPlayerSummary) {
         // try to update the record
         await payload.update({
            collection: "user-data",
            id,
            data: {
               data: summary,
               // @ts-expect-error this is fine
               site: "pogseal-imbhew2r8tg7",
            },
         });
      } else {
         console.log("no result, inserting new record");

         await payload.create({
            collection: "user-data",
            data: {
               data: summary,
               // @ts-expect-error this is fine
               site: "pogseal-imbhew2r8tg7",
               id,
            },
         });
      }

      // Then we'll update the global record
      if (oldGlobalSummary) {
         // try to update the record
         await payload.update({
            collection: "user-data",
            id: globalId,
            data: {
               data: newGlobalSummary,
               // @ts-expect-error this is fine
               site: "pogseal-imbhew2r8tg7",
            },
         });
      } else {
         // insert new record
         await payload.create({
            collection: "user-data",
            data: {
               data: newGlobalSummary,
               // @ts-expect-error this is fine
               site: "pogseal-imbhew2r8tg7",
               id: globalId,
            },
         });
      }
   } catch (e) {
      console.error("Error updating userData ", id, e);
   }

   return json({
      success: true,
      oldGlobalSummary,
      newGlobalSummary,
      addToGlobal,
   });
}

// we don't want this to revalidate
export const shouldRevalidate = () => false;
