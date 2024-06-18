// Track Achievements using Local Storage on this page!
// Note all achievements and subcategories / total roll currency rewards will be included if possible.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
   Form,
   useLoaderData,
   useSearchParams,
   useSubmit,
} from "@remix-run/react";
import type { Payload } from "payload";
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
import { use } from "i18next";

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
   });
}

export default function HomePage() {
   const [searchParams] = useSearchParams();
   const loaderData = useLoaderData<typeof loader>();
   const submit = useSubmit();

   const playerSummary = loaderData.playerSummary;

   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      // We want to fetch from the client, so submit it manually
      e.preventDefault();

      const body = new FormData(e.currentTarget);

      const result = await getConveneData({ body });

      console.log("this is a local fetch: ", result);

      if (!result || result.error) return alert("Error fetching data");

      // if global is checked, submit to global

      console.log(result);

      submit(result, {
         method: "POST",
         navigate: false,
         encType: "application/json",
      });
   }

   return (
      <div className="mx-auto max-w-[728px] max-laptop:p-3 laptop:pb-20">
         <H2 text="Warp History" />
         <div className="justify-left flex items-center gap-x-1">
            <Form method="POST" navigate={false} onSubmit={onSubmit}>
               <label htmlFor="url">Import URL</label>
               <input
                  name="url"
                  placeholder="Insert URL here"
                  type="url"
                  className="w-full"
                  defaultValue="https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?svr_id=591d6af3a3090d8ea00d8f86cf6d7501&player_id=500016561&lang=en&gacha_id=4&gacha_type=6&svr_area=global&record_id=cb1d1f2269e5442124eff6540823a570&resources_id=917dfa695d6c6634ee4e972bb9168f6a"
                  required
               />
               <select
                  className="my-2 inline-flex rounded-sm border p-2 dark:bg-neutral-800"
                  name="convene"
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
               <input type="checkbox" name="save" defaultChecked={true} />
               <input type="checkbox" name="refresh" defaultChecked={false} />
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
export async function getConveneData({ body }: { body: FormData }) {
   const url = body.get("url") as string;
   const convene = (body.get("convene") as string) || "1";
   const save = body.get("save") as string;
   const refresh = body.get("refresh") as string;

   if (!url) return { error: "No URL provided" };

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

      const summary = getSummary(gacha, convene);

      return {
         gacha,
         summary,
         playerId: wuwaPayload.playerId,
         convene,
         refresh,
         save,
         url,
      };
   } catch (e) {
      console.error(e);
      return { error: e };
   }
}

export async function action({
   request,
   context: { user, payload },
}: ActionFunctionArgs) {
   const { url, convene, summary, save, playerId, refresh } = JSON.parse(
      await request.text(),
   ) as {
      url: string;
      convene: string;
      save: string;
      refresh: string;
      summary: GachaSummaryType;
      playerId: string;
   };

   const id = "wuwa-" + playerId + "-" + convene;
   const globalId = "wuwa-convene-" + convene;

   // Check if these exists first
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
   } catch (e) {
      console.error(e);
   }
   try {
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

   console.log({
      id,
      globalId,
      oldPlayerSummary,
      oldGlobalSummary,
      addToGlobal,
      newGlobalSummary,
   });

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
            // for public access we're overriding access control here
            overrideAccess: true,
         });
      } else {
         console.log("no result, inserting new record");

         await payload.create({
            collection: "user-data",
            data: {
               id,
               data: summary,
               // @ts-expect-error this is fine
               site: "pogseal-imbhew2r8tg7",
               // @ts-expect-error we'll hardcode in an user for public access
               author: user?.id ?? "6447492be887aa8eaee61a4f",
            },
            // for public access we're overriding access control here
            overrideAccess: true,
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
            // for public access we're overriding access control here
            overrideAccess: true,
         });
      } else {
         // insert new record
         await payload.create({
            collection: "user-data",
            data: {
               id: globalId,
               data: newGlobalSummary,
               // @ts-expect-error this is fine
               site: "pogseal-imbhew2r8tg7",
               // @ts-expect-error we'll hardcode in an user for public access
               author: user?.id ?? "6447492be887aa8eaee61a4f",
            },
            // for public access we're overriding access control here
            overrideAccess: true,
         });
      }
   } catch (e) {
      console.error("Error updating userData ", id, e);
   }

   // update user-data
   const userData = await updateUserData(user, payload, {
      url,
      save,
      refresh,
   });

   // redirect and set url to cookie
   return redirect("/gacha?convene=" + convene, {
      headers: {
         "Set-Cookie": `wuwa-url=${url}; Path=/; Max-Age=31536000; SameSite=Strict`,
      },
   });
}

async function updateUserData(user: any, payload: Payload, data: any) {
   if (!user) return;

   try {
      return await payload.create({
         collection: "user-data",
         data: {
            id: "wuwa-" + user.id,
            data,
            // @ts-expect-error this is fine
            site: "pogseal-imbhew2r8tg7",
            author: user.id,
         },
         user,
         overrideAccess: false,
      });
   } catch (e) {
      console.error(user.username + " updating wuwa user-data");

      return await payload.update({
         collection: "user-data",
         id: "wuwa-" + user.id,
         data,
         user,
         overrideAccess: false,
      });
   }
}
