import {
   Chart as ChartJS,
   LinearScale,
   CategoryScale,
   BarElement,
   PointElement,
   LineElement,
   Legend,
   Tooltip,
   LineController,
   BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
   LinearScale,
   CategoryScale,
   BarElement,
   PointElement,
   LineElement,
   Legend,
   Tooltip,
   LineController,
   BarController,
);

// pities always from 1 to 80
const labels = Array.from({ length: 80 }, (_, i) => i + 1).map(String);

export const options = {
   responsive: true,
   interaction: {
      mode: "index" as const,
      intersect: false,
   },
   stacked: false,
   plugins: {
      title: {
         display: true,
         text: "Pities Chart",
      },
   },
   scales: {
      y: {
         type: "linear" as const,
         display: true,
         position: "left" as const,
      },
      y1: {
         type: "linear" as const,
         display: true,
         position: "right" as const,
         grid: {
            drawOnChartArea: false,
         },
      },
   },
};

export function LineandBarChart({
   pities,
}: {
   pities: Record<string, number>;
}) {
   // labels might be missing dates, fill in the gaps
   // [2021-01-01, 2021-01-03] => [2021-01-01, 2021-01-02, 2021-01-03]

   const barData = labels.map((pity) => pities[pity] || 0);

   const total = Object.values(pities).reduce((acc, cur) => acc + cur, 0);

   // line chart is a value from 0 to 100% of the total
   const lineData = [] as number[];

   barData.reduce((acc, cur) => {
      acc += cur;
      lineData.push(acc / total);
      return acc;
   });

   const data = {
      labels,
      datasets: [
         {
            type: "line" as const,
            label: "Chance%",
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            fill: false,
            data: lineData,
            yAxisID: "y",
         },
         {
            type: "bar" as const,
            label: "5* Convene",
            backgroundColor: "rgb(75, 192, 192)",
            data: barData,
            borderColor: "yellow",
            borderWidth: 2,
            yAxisID: "y1",
         },
      ],
   };

   return <Chart type="bar" options={options} data={data} />;
}
