if (this.isNull) return;
if (!['Oceania', 'Europe'].includes(this.properties.CONTINENT))
  return (this.geojson = this.geojson);

this.geojson.geometry.coordinates = this.geojson.geometry.coordinates.map(
  (coords) =>
    coords.map((coord) => {
      if (coord[0] < 40075017 * -0.25) {
        coord[0] += 40075017 - 1;
      }
      return coord;
    }),
);

this.geojson = this.geojson;
