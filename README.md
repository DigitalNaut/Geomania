# Development

## World Map SVG

The world map requires a few processing steps:

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

The country metadata is stored in the `src/assets/data/country-metadata.json` file.

It contains the following fields:

| Field    | Type    | Description                                                                 |
| -------- | ------- | --------------------------------------------------------------------------- |
| `a2`     | string  | [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code |
| `a3`     | string  | [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code |
| `name`   | string  | Country name                                                                |
| `isl`    | boolean | Is the country an island?                                                   |
| `terr`   | boolean | Is the country a territory?                                                 |
| `cont`   | string  | Continent name                                                              |
| `lat`    | number  | Latitude of the country's capital city                                      |
| `lon`    | number  | Longitude of the country's capital city                                     |
| `wiki`\* | string  | Wikipedia article title                                                     |

> \* The `wikipedia` field is only present if the Wikipedia article title is different from the country name.

## Fetching data from Wikipedia

There are two ways to get the data from Wikidata, one using the QID and the other using the Wiki title from the English Wikipedia. The QID is provided by Natural Earth, but the `enwiki` title is not. The "enwiki" title is required to get the data from the Wikidata API.

### Wikidata Query Service

Using the [Wikidata API](https://www.wikidata.org/w/api.php) to get the data from Wikidata, provide a QID and get the data in JSON format:

`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks/urls&sitefilter=enwiki&ids=<qid>`

<details>
  <summary>JSON response for QID Q858</summary>

```json
{
  "entities": {
    "Q858": {
      "type": "item",
      "id": "Q858",
      "sitelinks": {
        "enwiki": {
          "site": "enwiki",
          "title": "Syria",
          "badges": [],
          "url": "https://en.wikipedia.org/wiki/Syria"
        }
      }
    }
  },
  "success": 1
}
```

</details>

### Wikipedia API

Using the [Wikidata REST API](https://en.wikipedia.org/api/rest_v1/), provide the previous `enwiki.title` and get the content of the page in JSON format:

`https://en.wikipedia.org/api/rest_v1/page/summary/<enwiki.title>`

<details>
   <summary>JSON response for the title `Syria`</summary>

```json
{
  "type": "standard",
  "title": "Syria",
  "displaytitle": "<span class=\"mw-page-title-main\">Syria</span>",
  "namespace": { "id": 0, "text": "" },
  "wikibase_item": "Q858",
  "titles": {
    "canonical": "Syria",
    "normalized": "Syria",
    "display": "<span class=\"mw-page-title-main\">Syria</span>"
  },
  "pageid": 7515849,
  "thumbnail": {
    "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Flag_of_Syria.svg/320px-Flag_of_Syria.svg.png",
    "width": 320,
    "height": 213
  },
  "originalimage": {
    "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Flag_of_Syria.svg/900px-Flag_of_Syria.svg.png",
    "width": 900,
    "height": 600
  },
  "lang": "en",
  "dir": "ltr",
  "revision": "1165189429",
  "tid": "7bbab500-21a8-11ee-84b8-3f06ad190a96",
  "timestamp": "2023-07-13T15:39:25Z",
  "description": "Country in West Asia",
  "description_source": "local",
  "coordinates": { "lat": 35, "lon": 38 },
  "content_urls": {
    "desktop": {
      "page": "https://en.wikipedia.org/wiki/Syria",
      "revisions": "https://en.wikipedia.org/wiki/Syria?action=history",
      "edit": "https://en.wikipedia.org/wiki/Syria?action=edit",
      "talk": "https://en.wikipedia.org/wiki/Talk:Syria"
    },
    "mobile": {
      "page": "https://en.m.wikipedia.org/wiki/Syria",
      "revisions": "https://en.m.wikipedia.org/wiki/Special:History/Syria",
      "edit": "https://en.m.wikipedia.org/wiki/Syria?action=edit",
      "talk": "https://en.m.wikipedia.org/wiki/Talk:Syria"
    }
  },
  "extract": "Syria, officially the Syrian Arab Republic, is a West Asian country located in the Eastern Mediterranean and the Levant. It is a unitary republic that consists of 14 governorates (subdivisions), and is bordered by the Mediterranean Sea to the west, Turkey to the north, Iraq to the east and southeast, Jordan to the south, and Israel and Lebanon to the southwest. Cyprus lies to the west across the Mediterranean Sea. A country of fertile plains, high mountains, and deserts, Syria is home to diverse ethnic and religious groups, including the majority Syrian Arabs, Kurds, Turkmens, Assyrians, Circassians, Armenians, Albanians, Greeks, and Chechens. Religious groups include Muslims, Christians, Alawites, Druze, and Yazidis. The capital and largest city of Syria is Damascus. Arabs are the largest ethnic group, and Sunni Muslims are the largest religious group. Syria is the only country that is governed by Ba'athists, who advocate Arab socialism and Arab nationalism. Syria is a member of the Non-Aligned Movement and the Arab League.",
  "extract_html": "<p><b>Syria</b>, officially the <b>Syrian Arab Republic</b>, is a West Asian country located in the Eastern Mediterranean and the Levant. It is a unitary republic that consists of 14 governorates (subdivisions), and is bordered by the Mediterranean Sea to the west, Turkey to the north, Iraq to the east and southeast, Jordan to the south, and Israel and Lebanon to the southwest. Cyprus lies to the west across the Mediterranean Sea. A country of fertile plains, high mountains, and deserts, Syria is home to diverse ethnic and religious groups, including the majority Syrian Arabs, Kurds, Turkmens, Assyrians, Circassians, Armenians, Albanians, Greeks, and Chechens. Religious groups include Muslims, Christians, Alawites, Druze, and Yazidis. The capital and largest city of Syria is Damascus. Arabs are the largest ethnic group, and Sunni Muslims are the largest religious group. Syria is the only country that is governed by Ba'athists, who advocate Arab socialism and Arab nationalism. Syria is a member of the Non-Aligned Movement and the Arab League.</p>"
}
```

</details>

Alternatively, using a [query](https://en.wikipedia.org/w/api.php?action=help&modules=query) on the [MediaWiki API](https://en.wikipedia.org/w/api.php), a more concise version of the data can be obtained:

`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=pageimages|extracts&exintro&piprop=thumbnail&redirects=1&origin=*&titles=<enwiki.title>`

The parameters are:

| Parameter   | Value                  | Description                                                                       |
| ----------- | ---------------------- | --------------------------------------------------------------------------------- |
| `format`    | `json`                 | Output format                                                                     |
| `action`    | `query`                | Action to perform                                                                 |
| `prop`      | `extracts\|pageimages` | Which properties to get, in this case the page content and the thumbnail image    |
| `exintro`   |                        | Return only content before the first section heading instead of the whole article |
| `piprop`    | `thumbnail`            | Get the URL and dimensions of the thumbnail image associated with the page        |
| `redirects` | `1`                    | Automatically resolve redirects                                                   |
| `origin`    | `*`                    | Cross-site requests                                                               |
| `titles`    | `<enwiki.title>`       | Title of the page to query                                                        |

<details>
   <summary>JSON response for the title `Syria`</summary>

```json
{
  "batchcomplete": "",
  "warnings": {
    "extracts": {
      "*": "HTML may be malformed and/or unbalanced and may omit inline images. Use at your own risk. Known problems are listed at https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TextExtracts#Caveats."
    }
  },
  "query": {
    "pages": {
      "7515849": {
        "pageid": 7515849,
        "ns": 0,
        "title": "Syria",
        "extract": "<p class=\"mw-empty-elt\">\n\n</p>\n<p><b>Syria</b> (Arabic: <span lang=\"ar\" dir=\"rtl\">\u0633\u064f\u0648\u0631\u0650\u064a\u064e\u0627 or \u0633\u064f\u0648\u0631\u0650\u064a\u064e\u0629</span>, <small>romanized:\u00a0</small><span title=\"Arabic-language romanization\"><i lang=\"ar-Latn\">S\u016briy\u0101</i></span>), officially the <b>Syrian Arab Republic</b> (Arabic: <span lang=\"ar\" dir=\"rtl\">\u0627\u0644\u062c\u0645\u0647\u0648\u0631\u064a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629</span>, <small>romanized:\u00a0</small><span title=\"Arabic-language romanization\"><i lang=\"ar-Latn\">al-Jumh\u016br\u012byah al-\u02bbArab\u012byah as-S\u016br\u012byah</i></span>), is a West Asian country located in the Eastern Mediterranean and the Levant. It is a unitary republic that consists of 14 governorates (subdivisions), and is bordered by the Mediterranean Sea to the west, Turkey to the north, Iraq to the east and southeast, Jordan to the south, and Israel and Lebanon to the southwest. Cyprus lies to the west across the Mediterranean Sea. A country of fertile plains, high mountains, and deserts, Syria is home to diverse ethnic and religious groups, including the majority Syrian Arabs, Kurds, Turkmens, Assyrians, Circassians, Armenians, Albanians, Greeks, and Chechens. Religious groups include Muslims, Christians, Alawites, Druze, and Yazidis. The capital and largest city of Syria is Damascus. Arabs are the largest ethnic group, and Sunni Muslims are the largest religious group. Syria is the only country that is governed by Ba'athists, who advocate Arab socialism and Arab nationalism. Syria is a member of the Non-Aligned Movement and the Arab League. \n</p><p>The name \"Syria\" historically referred to a wider region, broadly synonymous with the Levant, and known in Arabic as <i>al-Sham</i>. The modern state encompasses the sites of several ancient kingdoms and empires, including the Eblan civilization of the 3rd millennium BC. Aleppo and the capital city Damascus are among the oldest continuously inhabited cities in the world. In the Islamic era, Damascus was the seat of the Umayyad Caliphate and a provincial capital of the Mamluk Sultanate in Egypt. The modern Syrian state was established in the mid-20th century after centuries of Ottoman rule. After a period as a French mandate (1923\u20131946), the newly-created state represented the largest Arab state to emerge from the formerly Ottoman-ruled Syrian provinces. It gained <i>de jure</i> independence as a democratic parliamentary republic on 24 October 1945 when the Republic of Syria became a founding member of the United Nations, an act which legally ended the former French mandate (although French troops did not leave the country until April 1946).\n</p><p>The post-independence period was tumultuous, with multiple military coups and coup attempts shaking the country between 1949 and 1971. In 1958, Syria entered a brief union with Egypt called the United Arab Republic, which was terminated by the 1961 Syrian coup d'\u00e9tat. The republic was renamed as the Arab Republic of Syria in late 1961 after the December 1 constitutional referendum of that year. A significant event was the 1963 coup d'\u00e9tat carried out by the military committee of the Arab Socialist Ba'ath Party which established a one-party state. It ran Syria under emergency law from 1963 to 2011, effectively suspending constitutional protections for citizens. Internal power-struggles within neo-Ba'athist factions caused further coups in 1966 and 1970, which eventually resulted in the seizure of power by General Hafez al-Assad. Assad assigned Alawite loyalists to key posts in the armed forces, bureaucracy, <i>Mukhabarat</i> and the ruling elite; effectively establishing an \"Alawi minority rule\" to consolidate power within his family.</p><p>After the death of Hafez al-Assad in 2000, his son Bashar al-Assad inherited the presidency and political system centered around a cult of personality to the al-Assad family. The Ba'ath regime is a totalitarian dictatorship that has been internationally condemned for its political repression alongside its numerous human rights abuses, including summary executions, massive censorship, forced disappearances, mass-murders, barrel-bombings, chemical attacks and other war-crimes. Following its violent suppression of the Arab Spring protests of the 2011 Syrian Revolution, the Syrian government was suspended from the Arab League in November 2011 for over 11 years, until its reinstatement in 2023. Syria quit the Union for the Mediterranean the following month. Since July 2011, Syria has been embroiled in a multi-sided civil war, with involvement of different countries. Organisation of Islamic Cooperation suspended Syria in August 2012 citing \"deep concern at the massacres and inhuman acts\" perpetrated by forces loyal to Bashar al-Assad. As of 2020, three political entities \u2013 the Syrian Interim Government, Syrian Salvation Government, and Autonomous Administration of North and East Syria \u2013 have emerged in Syrian territory to challenge Assad's rule.\n</p><p>Being ranked third last on the 2022 Global Peace Index and 5th highest in the 2023 Fragile States Index, Syria is one of the most violent countries in the world. The country is amongst the most dangerous places for journalism and is ranked 6th worst in 2023 World Press Freedom Index. Syria is the most corrupt country in the MENA region and was ranked the second lowest globally on the 2022 Corruption Perceptions Index.  The country has also become the epicentre of a state-sponsored multi-billion dollar illicit drug cartel, the largest in the world. The Syrian civil war has killed more than 570,000 people, with pro-Assad forces causing more than 90% of the total civilian casualties. The war led to the Syrian refugee crisis, with an estimated 7.6 million internally displaced people (July 2015 UNHCR figure) and over 5 million refugees (July 2017 registered by UNHCR), making population assessment difficult in recent years. The war has also worsened economic conditions, with more than 90% of the population living in poverty and 80% facing food insecurity.</p>\n\n\n"
      }
    }
  }
}
```

</details>

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

[![Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
