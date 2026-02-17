"use client";

import React from "react";
import Chart from "react-apexcharts";
type ApexchartApplicationProps = {
  percent: number;
};

const ApexchartApplication = ({ percent }: ApexchartApplicationProps) => {
  const series = [percent];

  const options: any = {
    chart: {
      type: "radialBar",
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 270,

        // 🔥 Ring thickness (smaller = thicker ring)
        hollow: {
          size: "62%", // earlier 70%
        },

        track: {
          background: "#E9DDFB",
          strokeWidth: "100%",
        },

        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "20px",
            fontWeight: "600",
            color: "#000",

            // 🎯 Center alignment fix
            offsetY: 4,
            formatter: (val: any) => `${val}%`,
          },
        },
      },
    },

    stroke: {
      lineCap: "round",
      width: 8, // 🔥 border thickness control
    },

    colors: ["#7E57C2"],
  };

  return (
    
      <Chart options={options} series={series} type="radialBar" width={128} height={128} />
    
  );
};

export default ApexchartApplication;
