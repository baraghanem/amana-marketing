"use client";
import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

interface RegionData {
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  spend: number;
  revenue: number;
}

interface BubbleMapProps {
  title: string;
  data: RegionData[];
}

// Simple gradient color scale function
const getColor = (value: number, min: number, max: number) => {
  if (max === min) return "rgb(34,197,94)"; // green default
  const ratio = (value - min) / (max - min);

  // Green → Yellow → Red
  const r = Math.floor(255 * ratio);
  const g = Math.floor(200 * (1 - ratio));
  const b = 80;
  return `rgb(${r},${g},${b})`;
};

export function BubbleMap({ title, data }: BubbleMapProps) {
  const geoUrl = "/maps/world-countries.json";

  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0));
  const minRevenue = Math.min(...data.map((d) => d.revenue || 0));

  const maxRadius = 25; // size of largest bubble

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      {/* Legend */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Low Revenue</span>
          <div
            className="w-40 h-3 rounded-full"
            style={{
              background:
                "linear-gradient(to right, rgb(34,197,94), rgb(234,179,8), rgb(239,68,68))",
            }}
          ></div>
          <span className="text-sm text-gray-300">High Revenue</span>
        </div>
      </div>

      {/* Map */}
      <ComposableMap projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
            {({ geographies }) =>
             geographies.map((geo) => (
            <Geography
            key={geo.rsmKey}
            geography={geo}
            fill="#3B4252"
            stroke="#6B7280"
            strokeWidth={0.5}
        />
      ))
    }
  </Geographies>

        {data.map((region, i) => {
          const size = (region.revenue / maxRevenue) * maxRadius + 4;
          const color = getColor(region.revenue, minRevenue, maxRevenue);
          return (
            <Marker
            key={i}
            coordinates={[region.longitude, region.latitude]}
            style={{
            default: { cursor: "pointer" },
            hover: { cursor: "pointer" }, // optional
            pressed: { cursor: "pointer" }, // optional
  }}
>
              <circle
                r={size}
                fill={color}
                fillOpacity={0.7}
                stroke="#fff"
                strokeWidth={0.6}
              />
              <title>{`${region.region}, ${region.country}\nRevenue: $${region.revenue.toLocaleString()}\nSpend: $${region.spend.toLocaleString()}`}</title>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
