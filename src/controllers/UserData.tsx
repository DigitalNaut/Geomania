import React from 'react';
import * as Realm from 'realm-web';

const REALM_APP_ID = 'geomania-gxxmr'; // e.g. myapp-abcde
export const realmApp: Realm.App = new Realm.App({ id: REALM_APP_ID });

// Displays the given user's details
export const UserDetail: React.FC<{ user: Realm.User }> = ({ user }) => {
  return (
    <div className="text-white">
      <h1>Logged in with id: {user.id} </h1>
    </div>
  );
};

// Lets an anonymous user log in
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

export async function getCountryGeometry(user: Realm.User, countryAlpha3: string) {
  const response: string = await user.functions.getCountryGeometry(countryAlpha3);
  const json: JSON = await JSON.parse(response);

  return json;
}

export default {
  UserDetail,
  Login,
  getCountryGeometry,
};
