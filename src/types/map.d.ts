export interface GeoJSON {
  type: string;
  features: Feature[];
}

export interface Feature {
  type: string;
  properties: Property;
  geometry: Geometry;
}

export interface Property {
  ADMIN: string;
  ISO_A3: string;
}

export interface Geometry {
  type: string;
  coordinates: number[][][][] | number[][][];
}
