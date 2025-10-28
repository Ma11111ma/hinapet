"use client";
import { useState } from "react";

type DistanceInfo = {
  text: string;
  value: number;
};

export function useDistanceMatrix() {
  const [distances, setDistances] = useState<Record<string, DistanceInfo>>({});
  const [durations, setDurations] = useState<Record<string, DistanceInfo>>({});
  const [loading, setLoading] = useState(false);

  const calculate = (
    origin: google.maps.LatLngLiteral,
    shelters: { id: string | number; lat: number; lng: number }[]
  ) => {
    if (!window.google || shelters.length === 0) return;
    if (loading) return;

    setLoading(true);

    const service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: shelters.map((s) => ({ lat: s.lat, lng: s.lng })),
        travelMode: google.maps.TravelMode.WALKING,
      },
      (response, status) => {
        try {
          if (status !== "OK" || !response) return;

          const newDistances: Record<string, DistanceInfo> = {} as Record<
            string,
            DistanceInfo
          >;
          const newDurations: Record<string, DistanceInfo> = {} as Record<
            string,
            DistanceInfo
          >;

          response.rows[0].elements.forEach((el, i) => {
            const shelterId = String(shelters[i].id) as string;
            newDistances[shelterId] = el.distance
              ? { text: el.distance.text, value: el.distance.value }
              : { text: "-", value: 0 };

            newDurations[shelterId] = el.duration
              ? { text: el.duration.text, value: el.duration.value }
              : { text: "-", value: 0 };
          });

          setDistances(newDistances);
          setDurations(newDurations);
        } catch (err) {
          console.error("DistanceMatrix error:", err);
        } finally {
          // ✅ ここで確実にローディング解除
          setLoading(false);
        }
      }
    );
  };

  return { distances, durations, loading, calculate };
}
