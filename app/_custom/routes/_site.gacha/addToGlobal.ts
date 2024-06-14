import type { ConveneType } from "payload/generated-custom-types";

import type { GachaSummaryType } from "./getSummary";

export type GlobalSummaryType = {
    convene?: ConveneType;
    total: number;
    players: number,
    resonators: number;
    weapons: number;
    pities: Array<number>;
    fiveStars: Record<string, Record<string, number>>; // shape is { resourceId: {date: count, ...},...}
 };

 export function toGlobal(summary: GachaSummaryType) {

    let
        convene = summary.convene,
        total = summary.total,
        players = 1,
        resonators = summary.resonators,
        weapons = summary.weapons,
        pities = Array.from({length: 81}, () => 0),
        fiveStars: Record<string, Record<string, number>> = {}; 

        // if no old summary, digest summary.fiveStars
        for (let i = 0; i < summary.fiveStars.length; i++) {
            const { resourceId, pity, time} = summary.fiveStars[i]!;

            const date = time.split(" ")[0];

            if(pity) pities[pity]!++;

            if(!fiveStars[resourceId]) fiveStars[resourceId] = {};

            if(date) {
                if(!fiveStars[resourceId][date]) fiveStars[resourceId][date] = 0;

            fiveStars[resourceId][date]!++;

            }

        }


    return { convene, total, players, resonators, weapons, pities, fiveStars } satisfies GlobalSummaryType;
 }


 // This function adds GlobalSummary a and b together
export function addGlobalSummary(a: GlobalSummaryType, b: GlobalSummaryType) {
    const convene = a.convene ?? b.convene;
    const total = a.total + b.total;
    const players = a.players + b.players;
    const resonators = a.resonators + b.resonators;
    const weapons = a.weapons + b.weapons;
    const fiveStars = { ...a.fiveStars };
    const pities = a.pities.map((pity, i) => pity + b.pities[i]!);

    for (const entry of Object.entries(b.fiveStars)) {
        const [resourceId, dates] = entry;
        if (!fiveStars[resourceId]) fiveStars[resourceId] = {};
        for (const date of Object.keys(dates)) {
            if (!fiveStars[resourceId][date]) fiveStars[resourceId][date] = 0;
            fiveStars[resourceId][date] += dates[date]!;
        }
    }

    return { convene, total, players, resonators, weapons, fiveStars, pities } satisfies GlobalSummaryType;
}


 // This function subsracts GlobalSummary a from b
 export function subGlobalSummary(a: GlobalSummaryType, b: GlobalSummaryType) {
    const convene = a.convene ?? b.convene;
    const total = a.total - b.total;
    const players = a.players - b.players;
    const resonators = a.resonators - b.resonators;
    const weapons = a.weapons - b.weapons;
    const fiveStars = { ...a.fiveStars };
    const pities = a.pities.map((pity, i) => pity - b.pities[i]!);

    for (const entry of Object.entries(b.fiveStars)) {
        const [resourceId, dates] = entry;
        if (!fiveStars[resourceId]) fiveStars[resourceId] = {};
        for (const date of Object.keys(dates)) {
            if (!fiveStars[resourceId][date]) fiveStars[resourceId][date] = 0;
            fiveStars[resourceId][date] -= dates[date]!;
        }
    }

    return { convene, total, players, resonators, weapons, fiveStars, pities } satisfies GlobalSummaryType;
 }