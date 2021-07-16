import React from "react";

interface Props {
  countries: string[];
}

const CountriesList: React.FC<Props> = ({ countries }) => {
  return (
    <div id="countriesList" className="min-h-screen p-4 bg-yellow-200">
      <div id="countriesListTitle" className="p-4 bg-yellow-600 rounded-md">
        Total countries: {countries.length}
      </div>
      <ol className="list-decimal list-inside">
        {countries.map((country, index) => (
          <li key={index}>{country}</li>
        ))}
      </ol>
    </div>
  );
};

export default CountriesList;
