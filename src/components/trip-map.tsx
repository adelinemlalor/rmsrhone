import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    __initTripMap?: () => void;
  }
}

let mapsPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
  if (!key) return Promise.reject(new Error("Maps browser key is not configured"));

  mapsPromise = new Promise<void>((resolve, reject) => {
    window.__initTripMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initTripMap&channel=${channel}`;
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

export type MapPoint = {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
};

export function TripMap({
  points,
  activeId,
  onSelect,
}: {
  points: MapPoint[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const infoRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        mapRef.current = new window.google.maps.Map(ref.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        infoRef.current = new window.google.maps.InfoWindow();
        setReady(true);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    Object.values(markersRef.current).forEach((m: any) => m.setMap(null));
    markersRef.current = {};
    if (!points.length) return;

    const bounds = new window.google.maps.LatLngBounds();
    const path: Array<{ lat: number; lng: number }> = [];

    points.forEach((p) => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current,
        label: { text: p.label, color: "#ffffff", fontSize: "11px", fontWeight: "700" },
        title: p.title,
      });
      marker.addListener("click", () => {
        infoRef.current.setContent(
          `<div style="font-family:inherit;max-width:220px"><strong>${escapeHtml(p.title)}</strong>${
            p.subtitle ? `<br/><span style="opacity:.7">${escapeHtml(p.subtitle)}</span>` : ""
          }</div>`,
        );
        infoRef.current.open({ map: mapRef.current, anchor: marker });
        onSelect?.(p.id);
      });
      markersRef.current[p.id] = marker;
      bounds.extend(marker.getPosition()!);
      path.push({ lat: p.lat, lng: p.lng });
    });

    const line = new window.google.maps.Polyline({
      path,
      strokeColor: "#4a5f52",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      map: mapRef.current,
    });
    markersRef.current["__line"] = line;

    if (points.length === 1) {
      mapRef.current.setCenter(bounds.getCenter());
      mapRef.current.setZoom(13);
    } else {
      mapRef.current.fitBounds(bounds, 64);
    }
  }, [ready, points, onSelect]);

  useEffect(() => {
    if (!ready || !activeId) return;
    const marker = markersRef.current[activeId];
    const point = points.find((p) => p.id === activeId);
    if (!marker || !point) return;
    mapRef.current.panTo(marker.getPosition());
    infoRef.current.setContent(
      `<div style="font-family:inherit;max-width:220px"><strong>${escapeHtml(point.title)}</strong>${
        point.subtitle ? `<br/><span style="opacity:.7">${escapeHtml(point.subtitle)}</span>` : ""
      }</div>`,
    );
    infoRef.current.open({ map: mapRef.current, anchor: marker });
  }, [activeId, ready, points]);

  if (error) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-[20px] border border-border bg-cream-2 p-6 text-center text-[13px] text-ink/60">
        {error}
      </div>
    );
  }

  return <div ref={ref} className="h-full min-h-[420px] w-full rounded-[20px] bg-cream-2" />;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
