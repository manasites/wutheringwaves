import { useState } from "react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { gql } from "graphql-request";

import { Icon } from "~/components/Icon";
import { Image } from "~/components/Image";
import { fetchList } from "~/routes/_site+/c_+/$collectionId/utils/fetchList.server";
import { listMeta } from "~/routes/_site+/c_+/$collectionId/utils/listMeta";
import { List } from "~/routes/_site+/c_+/_components/List";

export { listMeta as meta };

export async function loader({
   context: { payload },
   request,
}: LoaderFunctionArgs) {
   const { list } = await fetchList({
      request,
      gql: {
         query: QUERY_WEAPONS,
      },
      payload,
   });

   return json({ weapons: list?.data?.weapons?.docs });
}

export default function HomePage() {
   const { weapons } = useLoaderData<typeof loader>();

   return <WeaponList chars={weapons} />;
}

type FilterTypes = {
   id: string;
   name: string;
   field: string;
};

type FilterOptionType = {
   name: string;
   id: string;
   icon?: string;
};

const WeaponList = ({ chars }: any) => {
   const [filters, setFilters] = useState<FilterTypes[]>([]);
   const [sort, setSort] = useState("id");
   const [search, setSearch] = useState("");
   const [showDesc, setShowDesc] = useState(false);

   const sortOptions = [
      { name: "ID", field: "id" },
      { name: "Name", field: "name" },
   ];

   // All Filter Options listed individually atm to control order filter options appear in
   const rarities = [
      {
         id: "1",
         name: "1",
      },
      {
         id: "2",
         name: "2",
      },
      {
         id: "3",
         name: "3",
      },
      {
         id: "4",
         name: "4",
      },
      {
         id: "5",
         name: "5",
      },
   ] as FilterOptionType[];
   const types = [
      {
         id: "1",
         name: "Broadblade",
      },
      {
         id: "2",
         name: "Sword",
      },
      {
         id: "3",
         name: "Pistols",
      },
      {
         id: "4",
         name: "Gauntlets",
      },
      {
         id: "5",
         name: "Rectifier",
      },
   ] as FilterOptionType[];

   // const camps = chars.map((c) => {
   //    return c?.camp;
   // }).filter((v,i,a) => a.indexOf(v) === i);

   // sort((a,b) => {
   // return campsort.findIndex((x) => x.id == a) - campsort.findIndex((x) => x.id == b)})

   const filterOptions = [
      {
         name: "Rarity",
         field: "rarity",
         options: rarities,
      },
      { name: "Types", field: "type", options: types },
   ];

   console.log(filters);

   // var pathlist = filterUnique(chars.map((c: any) => c.path));

   // Sort entries
   var csorted = [...chars];
   csorted.sort((a, b) => (a[sort] > b[sort] ? 1 : b[sort] > a[sort] ? -1 : 0));

   // Filter entries
   // Filter out by each active filter option selected, if matches filter then output 0; if sum of all filters is 0 then show entry.
   let cfiltered = csorted.filter((char) => {
      var showEntry = filters
         .map((filt) => {
            var matches = 0;
            if (char[filt.field]?.id) {
               matches = char[filt.field]?.id == filt.id ? 0 : 1;
            } else {
               matches = char[filt.field] == filt.id ? 0 : 1;
            }
            return matches;
         })
         .reduce((p, a) => p + a, 0);

      return showEntry == 0;
   });

   // Filter search by name
   cfiltered = cfiltered.filter((char) => {
      return char.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
   });

   return (
      <List>
         <div className="divide-color-sub bg-2-sub border-color-sub divide-y rounded-md border">
            {filterOptions.map((cat) => (
               <div
                  className="cursor-pointer items-center justify-between gap-3 p-3 laptop:flex"
                  key={cat.name}
               >
                  <div className="text-1 flex items-center gap-2.5 text-sm font-bold max-laptop:pb-3">
                     {cat.name}
                  </div>
                  <div className="items-center justify-between gap-3 max-laptop:grid max-laptop:grid-cols-4 laptop:flex">
                     {cat.options.map((opt) => (
                        <div
                           key={opt.id}
                           className={`bg-3 shadow-1 border-color rounded-lg border px-2.5 py-1 shadow-sm ${
                              filters.find(
                                 (a) => a.id == opt.id && a.field == cat.field,
                              )
                                 ? `bg-zinc-50 dark:bg-zinc-500/10`
                                 : ``
                           }`}
                           onClick={(event) => {
                              if (
                                 filters.find(
                                    (a) =>
                                       a.id == opt.id && a.field == cat.field,
                                 )
                              ) {
                                 setFilters(
                                    filters.filter(
                                       (a) =>
                                          a.id != opt.id &&
                                          a.field != cat.field,
                                    ),
                                 );
                              } else {
                                 setFilters([
                                    // Allows only one filter per category
                                    ...filters.filter(
                                       (a) => a.field != cat.field,
                                    ),
                                    { ...opt, field: cat.field },
                                 ]);
                              }
                           }}
                        >
                           {opt?.icon && (
                              <div className="mx-auto h-9 w-9 rounded-full bg-zinc-800 bg-opacity-50">
                                 <Image
                                    className="mx-auto"
                                    alt="Icon"
                                    options="height=60"
                                    url={opt.icon}
                                 />
                              </div>
                           )}
                           <div className="text-1 truncate pt-0.5 text-center text-xs">
                              {opt.name}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
         {/* Search Text Box */}
         <div
            className="border-color-sub bg-2-sub shadow-1 mb-2 mt-3 flex h-12 items-center
                     justify-between gap-3 rounded-lg border px-3 shadow-sm"
         >
            <Icon name="search" className="text-zinc-500" size={20} />
            <input
               className="h-10 w-full flex-grow border-0 bg-transparent focus:outline-none"
               placeholder="Search..."
               value={search}
               onChange={(event) => {
                  setSearch(event.target.value);
               }}
            />
            <div className="text-1 flex items-center gap-1.5 pr-1 text-sm italic">
               <span>{cfiltered.length}</span> <span>entries</span>
            </div>
         </div>

         {/* Sort Options */}
         <div className="flex items-center justify-between py-3">
            <div className="text-1 flex items-center gap-2 text-sm font-bold">
               <Icon name="sort" size={16} className="text-zinc-500">
                  Sort
               </Icon>
            </div>
            <div className="flex items-center gap-2">
               {sortOptions.map((opt) => (
                  <div
                     key={opt.name}
                     className={`border-color text-1 shadow-1 relative cursor-pointer rounded-full 
                        border px-4 py-1 text-center text-sm font-bold shadow ${
                           sort == opt.field
                              ? `bg-zinc-50 dark:bg-zinc-500/10`
                              : ``
                        }`}
                     onClick={(event) => {
                        setSort(opt.field);
                     }}
                  >
                     {opt.name}
                  </div>
               ))}
            </div>
         </div>

         {/* Toggle Show Description */}
         <button
            type="button"
            className={`border-color-sub shadow-1 mb-3 block w-full rounded-full border-2 p-2.5 text-sm 
               font-bold underline decoration-zinc-500 underline-offset-2 shadow-sm ${
                  showDesc ? "bg-3-sub bg-zinc-50" : "bg-2-sub"
               }`}
            onClick={() => setShowDesc(!showDesc)}
         >
            Click to toggle full descriptions (R5)
         </button>

         {/* List with applied sorting */}
         <div
            className={` ${
               showDesc
                  ? ""
                  : "grid grid-cols-3 gap-2 text-center laptop:grid-cols-5"
            }`}
         >
            {cfiltered?.map((char) =>
               showDesc ? (
                  <EntryWithDescription char={char} key={char.id} />
               ) : (
                  <EntryIconOnly char={char} key={char.id} />
               ),
            )}
         </div>
      </List>
   );
};

// function filterUnique(input: any) {
//    var output: any = [];
//    for (var i = 0; i < input.length; i++) {
//       if (!output.find((a: any) => a.id == input[i].id)) {
//          output.push({
//             id: input[i].id,
//             name: input[i].name,
//             icon: input[i].icon?.url,
//          });
//       }
//    }

//    return output;
// }

const EntryWithDescription = ({ char }: any) => {
   const pathsmall = char?.path?.icon?.url;
   const rarityurl = char?.rarity?.icon?.url;
   const raritynum = char?.rarity?.display_number;
   const cid = char?.slug ?? char?.id;
   const skillname = char?.skill_name;
   const desc = char?.skill_desc;
   const params = char?.skill_params;

   var dispdesc = desc;
   params.map((par: any, i: any) => {
      dispdesc = dispdesc?.replace("{" + i + "}", par?.[4]);
   });

   return (
      <>
         <Link
            className="bg-2-sub border-color-sub shadow-1 relative mb-2.5 flex rounded-lg border shadow-sm"
            prefetch="intent"
            to={`/c/characters/${cid}`}
         >
            <div className="relative rounded-md p-3">
               {/* Icon */}
               <div className="relative inline-block h-24 w-24">
                  {/* Path + Path Name ? */}
                  {pathsmall ? (
                     <>
                        {" "}
                        <div className="absolute -left-1 top-0 z-20 h-7 w-7 rounded-full bg-gray-800 bg-opacity-50">
                           <Image
                              alt="Icon"
                              className="relative inline-block object-contain"
                              url={pathsmall}
                           />
                        </div>
                     </>
                  ) : null}

                  {/* Rarity */}
                  <div
                     style={{ "border-color": `#${char.rarity?.color}` }}
                     className="absolute -bottom-2 w-full transform border-b-4"
                  >
                     {/* <Image
                alt={raritynum}
                className={`z-20 h-4 w-28 rounded-full object-contain color-rarity-${
                  raritynum ?? "1"
                } bg-opacity-10`}
                url={rarityurl}
              /> */}
                  </div>

                  <Image
                     className="object-contain"
                     url={char.icon?.url}
                     alt={char?.name}
                  />
               </div>
               {/* Name */}
               <div className="mt-3 text-center text-xs ">{char.name}</div>
            </div>
            <div className="relative p-3 align-middle text-sm">
               <div className="font-bold text-md">{skillname}</div>
               <div
                  dangerouslySetInnerHTML={{ __html: dispdesc }}
                  className=""
               ></div>
            </div>
         </Link>
      </>
   );
};

const EntryIconOnly = ({ char }: any) => {
   const pathsmall = char?.path?.icon?.url;
   const rarityurl = char?.rarity?.icon?.url;
   const raritynum = char?.rarity?.display_number;
   const cid = char?.id;

   return (
      <>
         <Link
            prefetch="intent"
            className="shadow-1 bg-2-sub border-color-sub rounded-lg border p-1 shadow-sm"
            to={`/c/weapons/${cid}`}
         >
            {/* Icon */}
            <div className="relative inline-block h-28 w-28">
               {/* Path + Path Name ? */}
               {pathsmall ? (
                  <>
                     <div className="absolute -right-1 top-0 z-20 h-7 w-7 rounded-full bg-gray-800 bg-opacity-50">
                        <Image
                           alt="Icon"
                           className="relative inline-block object-contain"
                           url={pathsmall}
                        />
                     </div>
                  </>
               ) : null}

               {/* Rarity */}
               <div
                  style={{ "border-color": `#${char.rarity?.color}` }}
                  className="absolute -bottom-2 w-full transform border-b-4"
               ></div>

               <Image
                  options="height=150"
                  className="object-contain"
                  url={char.icon?.url}
                  alt={char?.name}
               />
            </div>
            {/* Name */}
            <div className="pt-1 text-center text-xs font-bold ">
               {char.name}
            </div>
         </Link>
      </>
   );
};

const QUERY_WEAPONS = `
  query {
    weapons: Weapons(limit: 500) {
      docs {
         id
         name
         desc
         slug
         rarity {
            id
            color
         }
         icon {
            url
         }
         type {
            id
            name
         }
         skill_name
         skill_desc
         skill_params
      }
    }
  }
`;
