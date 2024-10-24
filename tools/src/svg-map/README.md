# SVG Map Builder

## Description

This tool creates the SVG maps for Geomaniac.

All data sources are retrieved from the [Natural Earth Data website](https://www.naturalearthdata.com/downloads/).

We use the `50m-cultural-vectors` dataset which you can download [here](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/) (~780 KB).

### Behavior

A direct download link isn't allowed by the server without a referrer.

For this reason, we have to download the data via:

```bash
curl -o archive.zip -L -e  ne_50m_admin_0_countries.zip https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip
```

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
