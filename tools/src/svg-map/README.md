# SVG Map Builder

## Description

Since Geomaniac relies on geographical data to display its maps, it needs a system to filter, transform, and organize the data for its UI.

This tool creates those SVG maps for Geomaniac using Mapshaper.

## Technical details

All data sources are retrieved from the [Natural Earth Data website](https://www.naturalearthdata.com/downloads/).

We use the `50m-cultural-vectors` dataset which you can download [here](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/) (~780 KB).

### Behavior

## Prerequisites

The script will look for the first ShapeFile (.shp) in the `/in` directory and use that as its source. Otherwise, it'll prompt you to download the `50m-cultural-vectors` ShapeFile.

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

## Development Details

### Dependencies

The main dependencies are:

- [Mapshaper](https://mapshaper.org/): Transforms and filters the data
- [proj4](http://https://github.com/proj4js/proj4js/): Auxiliary library for coordinate transformations to cover an edge case with Mapshaper

### Issues & Workarounds

#### Introduction

The data from Natural Earth Data contains features that wrap around the map along the 180th Meridian, which provides a poor UX when the camera is panning around wildly.

We've chosen to transpose and join these features using the tools available with Mapshaper. Doing this has unfortunately been a challenge on a couple fronts.

Here we document the issues and workarounds we've encountered while using Mapshaper for our use case.

#### Mapshaper clips features out of bounds when applying a projection

> Problem: Using a `-proj` command on any map with features that have been transposed causes Mapshaper to clip the features out of bounds. See [this issue](https://github.com/mbloch/mapshaper/issues/672) for discussion.

This means that we can't freely transpose features and project them back and forth as needed--we must choose one a pivotal moment when to do it, which is very restrictive.

In our case we need:

- A map (SVG) of the regions projected in `EPSG:3857` so we can output the files as SVG to match the intended look
- A features (GeoJSON) file detailing the BBox & labels in `WGS84`
- A map (SVG) file visualizing the BBox preferably in `EPSG:3857`

We can't use `EPSG:3857` as an output projection because not only does it have a huge projection range of -20037500 to 20037500, Leaflet requires the bounds file to be in the range of -180 and 180.

This means that we must project the features once before transposing them and then transform them back to complete the data. Doing so leads to loss of data and features being stretched across the map.

Since no solution is available at this time for dealing with coordinates natively, we're forced to use Proj4 to project coordinates after the main projection and transposition.

We do this by [creating a function "on-the-fly"](https://github.com/mbloch/mapshaper/wiki/Command-Reference#-run) that loads a local module that leverages the Proj4 library.

#### Mapshaper outputs two maps in a single SVG

> Problem: When filtering layer data by country, Mapshaper keeps all the layers and their associated data around, which somehow creates a second map in the SVG with the filtered data.

To solve this, we remove the extra layers with the duplicated data using the `-drop` command.

We've added this redundancy in the continents section of the script although this was only observed with the subregions map.