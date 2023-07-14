# About

## World Map SVG

The world map requires several processing steps:

1. Download the data from [Natural Earth](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/) and unzip it. [Direct link](https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip)
2. We need to simplify the data while preserving the islands:

   - Drag and drop the [shapefile](https://en.wikipedia.org/wiki/Shapefile) (.shp), project (.prj) and database files (.dbf) into [MapShaper](https://mapshaper.org/) so that we keep the country attributes. Leave "detect line intersections" checked.
   - In the `Console` tab, run the command

   ```bash
   -explode -simplify weighted keep-shapes 10% -clean -proj merc -dissolve ADM0_A3 copy-fields=ADMIN -o map.geojson format=geojson
   ```

   This will split the multi-polygons into individual polygons so that we can simplify the polygons down to 10% without losing the islands. It'll clean up the shape intersections, project the data into Mercator, and join the polygons back to multi-polygons. The `-o` command will output the data as a GeoJSON file called "map.geojson".

   > Check the [commands documentation](https://github.com/mbloch/mapshaper/wiki/Command-Reference) for more information.

3. Finally, we need to convert the GeoJSON to SVG but keep the country attributes.

   - Get my [GeoJSON to SVG converter](github.com/digitalNaut/geojson2svg). Follow the instructions to set up. It's as easy as `npm install` in a terminal with [Node.js](https://nodejs.org/en/) installed.
   - Drop the "map.geojson" file into the `/in` folder and run

   ```bash
   npm start -o world-map-mercator -a "properties.ADMIN" "properties.ADM0_A3 A3"
   ```

   This will convert the GeoJSON to SVG and keep the attributes `ADMIN` and `A3` by pulling them from the GeoJSON properties. The `-o` command will output the data as an SVG file called "world-map-mercator.svg".

   - The output will be in the `/out` folder. Copy the new 'world-map-mercator.svg' file to the `/src/assets/images` folder.

No other processing is required. The map is ready to use. The size of the image should be 250x250px, the file size should be under 200 KB, and it should contain the attributes `ADMIN` and `A3`.

## Country Metadata

The country metadata is stored in the `src/assets/data/countries.json` file. It's a JSON array of objects with the following properties:
