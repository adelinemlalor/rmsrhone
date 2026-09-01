import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  queries: z.array(z.string().min(2).max(300)).min(1).max(25),
});

export type GeocodeResult = { query: string; lat: number | null; lng: number | null };

export const geocodePlaces = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<GeocodeResult[]> => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !mapsKey) throw new Error("Maps credentials are not configured");

    const gateway = "https://connector-gateway.lovable.dev/google_maps";
    const unique = Array.from(new Set(data.queries));

    const results = await Promise.all(
      unique.map(async (query): Promise<GeocodeResult> => {
        const res = await fetch(`${gateway}/places/v1/places:searchText`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": mapsKey,
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "places.location",
          },
          body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
        });

        if (res.status === 403) {
          const details: Array<{ reason?: string }> =
            (await res.json().catch(() => ({})))?.error?.details ?? [];
          const reason = details.find((d) => d.reason)?.reason;
          if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
            throw new Error(
              'Google Maps server key is referrer-restricted. Set the server key\'s application restrictions to "None" or "IP addresses".',
            );
          }
          if (reason === "API_KEY_SERVICE_BLOCKED") {
            throw new Error(
              "Google Maps server key does not allow the Places API. Add it to the key's allowed-APIs list.",
            );
          }
          throw new Error("Google Maps request was denied (403).");
        }

        if (!res.ok) {
          const body = await res.text();
          console.error(`Places search failed [${res.status}]: ${body}`);
          return { query, lat: null, lng: null };
        }

        const json = (await res.json()) as {
          places?: Array<{ location?: { latitude: number; longitude: number } }>;
        };
        const loc = json.places?.[0]?.location;
        return { query, lat: loc?.latitude ?? null, lng: loc?.longitude ?? null };
      }),
    );

    return results;
  });
