export interface Feature {
  properties: Property;
}

export interface Property {
  ADMIN: string;
  ISO_A3: string;
}

// interface Data {
//   features: {
//     type: string;
//     properties: { ADMIN: string; ISO_A3: string };
//     geometry: { type: string; coordinates: number[][][] };
//   };
// }