# SVG Map Builder

## Description

This tool creates the SVG maps for Geomaniac.

All data sources are available from the [Natural Earth Data website](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/).

A direct download link isn't allowed by the server to download automatically so they'll need to be manually downloaded and saved to the [in](./in/) directory.

The script will look for the first ShapeFile (.shp) and use that as its source.

## How to use

For creating all maps, use:

```bash
pnpm svg-map
```

## Output

The output is located in the [out](./out/) directory.

The following files are generated:

- `*.svg` map of the countries
- `.json` file of the features
- `*.svg` map of the continents
