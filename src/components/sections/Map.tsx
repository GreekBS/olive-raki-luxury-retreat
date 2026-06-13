"use client";

import type { MapPoint } from "@/data/location";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const markerColors: Record<MapPoint["type"], string> = {
  property: "#443a31",
  city: "#b5654a",
  airport: "#4a8494",
  beach: "#6b7a52",
  attraction: "#9a8570",
};

function createIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

interface MapProps {
  points: MapPoint[];
  center: [number, number];
}

export default function Map({ points, center }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      className="h-[400px] w-full md:h-[500px]"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createIcon(markerColors[point.type])}
        >
          <Popup>
            <strong>{point.name}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
