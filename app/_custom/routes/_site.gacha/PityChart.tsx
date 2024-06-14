import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend,
);

export function Bar({ pity }: { pity: Record<string, number> }) {
   const labels = Object.keys(pity);

   //    const options = {
   //       plugins: {
   //          title: {
   //             display: true,
   //             text: "Pity Rate",
   //          },
   //       },
   //       responsive: true,
   //       scales: {
   //          x: {
   //             stacked: true,
   //          },
   //          y: {
   //             stacked: true,
   //          },
   //       },
   //    };

   const data = {
      labels,
      datasets: [
         {
            label: "Dataset 1",
            data: Object.values(pity),
            backgroundColor: "rgb(255, 99, 132)",
         },
         //   {
         //     label: 'Dataset 2',
         //     data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
         //     backgroundColor: 'rgb(75, 192, 192)',
         //   },
         //   {
         //     label: 'Dataset 3',
         //     data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
         //     backgroundColor: 'rgb(53, 162, 235)',
         //   },
      ],
   };

   return <Bar options={options} data={data} />;
}
