"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";

// react-globe.gl touches `window`/WebGL — must never render on the server.
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export interface GlobeVisit {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
}

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  size: number;
  color: string;
}

const GLOBE_IMAGE_URL = "/globe-dots.png";
const HEIGHT = 420;

export default function Globe3D({ visits }: { visits: GlobeVisit[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Read the width synchronously on mount rather than waiting for the
    // ResizeObserver's first callback — some environments never fire it for
    // an element whose size hasn't changed since it was already correctly
    // sized at observe() time. The observer still handles later resizes.
    setWidth(el.offsetWidth);
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Auto-rotate slowly until the visitor grabs the globe — Shopify's
    // dashboard globe does the same. Stops permanently on first drag.
    const controls = globeRef.current?.controls();
    if (!controls) return;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    const stop = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [width]);

  const points: GlobePoint[] = visits
    .filter((v): v is GlobeVisit & { latitude: number; longitude: number } => v.latitude != null && v.longitude != null)
    .map((v) => ({
      lat: v.latitude,
      lng: v.longitude,
      label: [v.city, v.country].filter(Boolean).join(", "),
      size: 0.6,
      color: "#f97316",
    }));

  return (
    <div
      ref={containerRef}
      style={{ height: HEIGHT }}
      className="flex items-center justify-center overflow-hidden rounded-xl bg-white"
    >
      {width > 0 && (
        <Globe
          ref={globeRef}
          width={width}
          height={HEIGHT}
          globeImageUrl={GLOBE_IMAGE_URL}
          showGlobe
          showAtmosphere={false}
          backgroundColor="#ffffff"
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointLabel="label"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.015}
          pointsMerge={false}
          pointResolution={12}
        />
      )}
    </div>
  );
}
