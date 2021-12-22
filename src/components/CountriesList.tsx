import React from 'react';

interface Props {
  countries: string[];
}

export default function CountriesList({ countries }: Props) {
  return (
    <div id="countriesList" className="min-h-screen p-4 bg-yellow-200">
      <div id="countriesListTitle" className="p-4 bg-yellow-600 rounded-md">
        Total countries: {countries.length}
      </div>
      <ol className="list-decimal list-inside">
        {countries.map((country) => (
          <li key={country}>{country}</li>
        ))}
      </ol>
    </div>
  );
}
