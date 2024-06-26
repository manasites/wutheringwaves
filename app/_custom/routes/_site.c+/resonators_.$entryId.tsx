import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { gql } from "graphql-request";
import { Entry } from "~/routes/_site+/c_+/$collectionId_.$entryId/components/Entry";
import { entryMeta } from "~/routes/_site+/c_+/$collectionId_.$entryId/utils/entryMeta";
import { fetchEntry } from "~/routes/_site+/c_+/$collectionId_.$entryId/utils/fetchEntry.server";
import { Main } from "~/_custom/components/resonators/resonators.Main";
import { ResonatorSkill } from "~/_custom/components/resonators/resonators.Skill";
import { ResonatorPassiveNodes } from "~/_custom/components/resonators/resonators.PassiveNodes";
import { ResonatorResonanceChain } from "~/_custom/components/resonators/resonators.ResonanceChain";
import { ResonatorAscension } from "~/_custom/components/resonators/resonators.Ascension";
import { ResonatorTotalMaterialCost } from "~/_custom/components/resonators/resonators.TotalMaterialCost";
import { ResonatorSpecialty } from "~/_custom/components/resonators/resonators.Specialty";
import { ResonatorGallery } from "~/_custom/components/resonators/resonators.Gallery";
import { ResonatorProfile } from "~/_custom/components/resonators/resonators.Profile";
import { ResonatorStory } from "~/_custom/components/resonators/resonators.Story";
import { ResonatorVoiceLines } from "~/_custom/components/resonators/resonators.VoiceLines";

export { entryMeta as meta };

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderFunctionArgs) {
   const fetchResonatorData = fetchEntry({
      payload,
      params,
      request,
      user,
      gql: {
         query: ResonatorQuery,
      },
   });

   const fetchRecipeData = fetchEntry({
      payload,
      params,
      request,
      user,
      gql: {
         query: CookingRecipesQuery,
      },
   });

   const [{ entry }, { entry: recipeData }] = await Promise.all([
      fetchResonatorData,
      fetchRecipeData,
   ]);

   return json({
      entry,
      recipeData: recipeData.data.CookingRecipes.docs,
   });
}

const SECTIONS = {
   main: Main,
   "skill-nodes": ResonatorSkill,
   "passive-nodes": ResonatorPassiveNodes,
   "resonance-chain": ResonatorResonanceChain,
   "ascension-cost": ResonatorAscension,
   "total-materials": ResonatorTotalMaterialCost,
   "cooking-specialty": ResonatorSpecialty,
   "image-gallery": ResonatorGallery,
   profile: ResonatorProfile,
   story: ResonatorStory,
   "voice-lines": ResonatorVoiceLines,
   // gallery: ImageGallery,
};

export default function EntryPage() {
   const { entry, recipeData } = useLoaderData<typeof loader>();
   const resonatorData = {
      Resonator: entry.data.Resonator,
      Curves: entry.data.ResonatorCurves.docs,
      Recipes: recipeData,
   };
   return <Entry customComponents={SECTIONS} customData={resonatorData} />;
}

const ResonatorQuery = gql`
   query Resonator($entryId: String!) {
      Resonator(id: $entryId) {
         id
         name
         nickname
         intro
         slug
         rarity {
            id
            color
         }
         icon {
            url
         }
         element {
            id
            name
            icon {
               url
            }
         }
         weapon_type {
            id
            name
         }
         stats {
            attribute {
               id
               name
               icon {
                  url
               }
               percent
               visible
            }
            value
         }
         ascension_costs {
            level
            items {
               item {
                  id
                  slug
                  name
                  icon {
                     url
                  }
                  rarity {
                     id
                     color
                  }
               }
               cnt
            }
         }
         resonance_chain {
            name
            desc
            icon {
               url
            }
         }
         skill_tree {
            id
            node_type
            bonus_name
            bonus_desc
            bonus_icon {
               url
            }
            unlock_costs {
               item {
                  id
                  slug
                  name
                  icon {
                     url
                  }
                  rarity {
                     id
                     color
                  }
               }
               cnt
            }
            resonator_skill {
               id
               slug
               name
               desc
               params
               icon {
                  url
               }
               type {
                  name
               }
               max_lv
               details {
                  name
                  values {
                     level
                     value
                  }
               }
               upgrade_costs {
                  lv
                  items {
                     item {
                        id
                        slug
                        name
                        icon {
                           url
                        }
                        rarity {
                           id
                           color
                        }
                     }
                     cnt
                  }
               }
            }
         }
         birthday
         gender
         birthplace
         affiliation
         resonance_power
         resonance_eval_report
         overclock_diagnostic_report
         vo_en
         vo_ja
         vo_ko
         vo_zh
         stories {
            title
            content
         }
         quotes {
            title
            content
            vo_zh {
               url
            }
            vo_ja {
               url
            }
            vo_en {
               url
            }
            vo_ko {
               url
            }
         }
         card_img {
            url
         }
         gacha_splash_bg {
            url
         }
         gacha_splash_fg {
            url
         }
         gacha_splash_full {
            url
         }
         gacha_share_img {
            url
         }
      }

      ResonatorCurves(limit: 200, sort: "level") {
         docs {
            id
            level
            lb_lv
            ratios {
               value
            }
         }
      }
   }
`;

const CookingRecipesQuery = gql`
   query CookingRecipes($entryId: JSON!) {
      CookingRecipes(
         where: { special_dishes__resonator: { equals: $entryId } }
      ) {
         docs {
            id
            result_item {
               id
               name
               icon {
                  url
               }
               rarity {
                  id
                  color
               }
            }
            special_dishes {
               resonator {
                  id
                  name
               }
               item {
                  id
                  name
                  icon {
                     url
                  }
                  rarity {
                     id
                     color
                  }
               }
            }
         }
      }
   }
`;
