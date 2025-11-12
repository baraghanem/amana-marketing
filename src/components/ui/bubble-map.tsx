"use client";
import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

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

// Gradient helper (green → yellow → red)
const getColor = (value: number, min: number, max: number) => {
  if (max === min) return "rgb(34,197,94)"; // green
  const ratio = (value - min) / (max - min);
  const r = Math.floor(255 * ratio);
  const g = Math.floor(200 * (1 - ratio));
  const b = 80;
  return `rgb(${r},${g},${b})`;
};

export function BubbleMap({ title, data }: BubbleMapProps) {
  // ✅ Use working world map topojson source
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0));
  const minRevenue = Math.min(...data.map((d) => d.revenue || 0));

  const maxRadius = 25;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      {/* Legend */}
      <div className="flex items-center justify-center mb-4">
        <span className="text-sm text-gray-300 mr-2">Low Revenue</span>
        <div
          className="w-40 h-3 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgb(34,197,94), rgb(234,179,8), rgb(239,68,68))",
          }}
        />
        <span className="text-sm text-gray-300 ml-2">High Revenue</span>
      </div>

      {/* Map */}
      <ComposableMap projectionConfig={{ scale: 150 }}>
        <ZoomableGroup center={[20, 10]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#3B4252"
                  stroke="#6B7280"
                  strokeWidth={0.4}
                />
              ))
            }
          </Geographies>

          {/* Bubbles */}
          {data.map((region, i) => {
            const size = (region.revenue / maxRevenue) * maxRadius + 4;
            const color = getColor(region.revenue, minRevenue, maxRevenue);

            // slight jitter (anti-overlap)
            const jitter = (Math.random() - 0.5) * 0.8;
            const adjustedCoords: [number, number] = [
              region.longitude + jitter,
              region.latitude + jitter,
            ];

            return (
              <Marker key={i} coordinates={adjustedCoords}>
                <circle
                  r={size}
                  fill={color}
                  fillOpacity={0.7}
                  stroke="#fff"
                  strokeWidth={0.6}
                />
                <title>
                  {`${region.region}, ${region.country}\nRevenue: $${region.revenue.toLocaleString()}\nSpend: $${region.spend.toLocaleString()}`}
                </title>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
