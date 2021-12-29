import React from 'react';
import * as Realm from 'realm-web';

const REALM_APP_ID = 'geomania-gxxmr'; // e.g. myapp-abcde
export const realmApp: Realm.App = new Realm.App({ id: REALM_APP_ID });

// Create a component that displays the given user's details
export const UserDetail: React.FC<{ user: Realm.User }> = ({ user }) => {
  return (
    <div>
      <h1>Logged in with anonymous id: {user.id} </h1>
    </div>
  );
};
// Create a component that lets an anonymous user log in
export const Login: React.FC<{ setUser: (user: Realm.User) => void }> = ({ setUser }) => {
  const loginAnonymous = async () => {
    const user: Realm.User = await realmApp.logIn(Realm.Credentials.anonymous());
    setUser(user);
  };
  return (
    <button type="button" onClick={loginAnonymous}>
      Log In
    </button>
  );
};

// type CountryFeature = {
//   _id: string;
//   type: string;
//   properties: {
//     ADMIN: string;
//     ISO_A3: string;
//   };
//   geometry: {
//     type: string;
//     coordinates: number[][][][];
//   };
// };

export async function getData(user: Realm.User, countryAlpha3: string) {
  const response: string = await user.functions.getCountryGeometry(countryAlpha3);
  const json: JSON = await JSON.parse(response);

  console.log(json);

  return json;
}

export default {
  UserDetail,
  Login,
  getData,
};
