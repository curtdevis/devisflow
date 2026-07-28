"use client";

import { useMemo } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import worldTopology from "@/data/world-110m.json";

const WIDTH = 960;
const HEIGHT = 500;

export interface MapVisit {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
}

export default function WorldMap({ visits }: { visits: MapVisit[] }) {
  const { countryPaths, project } = useMemo(() => {
    const topology = worldTopology as unknown as Topology;
    const countries = feature(topology, topology.objects.countries as GeometryCollection);
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], countries);
    const path = geoPath(projection);
    return {
      countryPaths: countries.features.map((f) => ({ id: f.id, d: path(f) ?? "" })),
      project: (lng: number, lat: number) => projection([lng, lat]),
    };
  }, []);

  const points = visits
    .filter((v): v is MapVisit & { latitude: number; longitude: number } => v.latitude != null && v.longitude != null)
    .map((v) => {
      const xy = project(v.longitude, v.latitude);
      return xy ? { x: xy[0], y: xy[1], label: [v.city, v.country].filter(Boolean).join(", ") } : null;
    })
    .filter((p): p is { x: number; y: number; label: string } => p !== null);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Carte des visiteurs en temps réel"
    >
      {countryPaths.map((c) => (
        <path key={String(c.id)} d={c.d} fill="#e5e9f0" stroke="#cbd5e1" strokeWidth={0.5} />
      ))}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={6} fill="#f97316" opacity={0.25}>
            <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={p.x} cy={p.y} r={2.5} fill="#f97316">
            <title>{p.label}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
