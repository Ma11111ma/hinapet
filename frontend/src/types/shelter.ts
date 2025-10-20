// frontend/src/types/shelter.ts
export type ShelterType = "accompany" | "companion";
export type CrowdLevel = "empty" | "few" | "full";

export type Shelter = {
  id: string;
  name: string;
  address: string;
  type: ShelterType;
  capacity: number;
  lat: number;
  lng: number;
  crowd_level?: CrowdLevel;
};
