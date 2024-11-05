import chalk from "chalk";
import {
  loadCountryCatalog,
  deriveContinents,
  countriesCatalogByContinent,
  summarizeContinentCatalog,
  CountryQueue,
} from "./lib.js";

const excludedContinents = ["Antarctica"];

async function measureScriptExecutionTime(callback: () => Promise<void>) {
  performance.mark("script-start");

  await callback();

  performance.mark("script-end");
  performance.measure("script-execution", "script-start", "script-end");

  console.log(
    chalk.blue(`\nScript execution time: ${performance.getEntriesByName("script-execution")[0].duration.toFixed(2)}ms`),
  );
}

async function main() {
  const countryCatalog = await loadCountryCatalog("../../../src/assets/data/features/countries.json");
  const continentCatalog = countriesCatalogByContinent(countryCatalog);
  const continentNames = deriveContinents(continentCatalog, excludedContinents);

  if (excludedContinents.length)
    console.log(`Excluded continents (${excludedContinents.length}): ${excludedContinents.join(", ")}`);

  if (continentNames.length) {
    console.log(chalk.green(`Parsed ${continentNames.length} continents`));
  } else {
    console.log(chalk.red("No continents found. Exiting..."));
    process.exit(1);
  }

  console.table(continentNames);
  console.table(summarizeContinentCatalog(continentCatalog));

  const continentIndex = Math.floor(Math.random() * continentNames.length);
  const continent = continentNames[continentIndex];

  console.log(`Selected continent: ${continent}`);

  const continentQueue = new CountryQueue(continent, continentCatalog);

  const countriesToBan =
    continentQueue.countryStack
      ?.slice()
      ?.sort(() => Math.random() - 0.5)
      .slice(0, continentQueue.countryStack.length * 0.9) ?? [];

  for (const country of countriesToBan) {
    continentQueue.blacklist(country);
  }

  console.log(`Countries banned: ${continentQueue.countryBlacklist.join(", ")}`);

  const log = new Map<string, number>();
  for (let i = 0; i < 1000; i++) {
    const country = String(continentQueue.next());
    if (!country) break;

    log.set(country, (log.get(country) ?? 0) + 1);
  }
  console.table(log);
}

measureScriptExecutionTime(main);
