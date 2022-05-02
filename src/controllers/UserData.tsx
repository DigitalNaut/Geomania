import React from 'react';
import { App, User, Credentials } from 'realm-web';

export const realmApp: App = new App({
  id: process.env.REACT_APP_REALM_APP_ID || '',
});

type UserDetailsProps = {
  user: User;
};

// Displays the given user's details
export const UserDetail: React.FC<UserDetailsProps> = ({ user }) => {
  return (
    <div className="text-white">
      <h1>Logged in. ID: {user.id} </h1>
    </div>
  );
};

// Lets an anonymous user log in
export const Login: React.FC<{ setUser: (user: User) => void }> = ({ setUser }) => {
  const loginAnonymous = async () => {
    const user: User = await realmApp.logIn(Credentials.anonymous());
    setUser(user);
  };
  return (
    <button type="button" onClick={loginAnonymous}>
      Log In
    </button>
  );
};

export async function getCountryGeometry(user: User, countryAlpha3: string) {
  const response: string = await user.functions.getCountryGeometry(countryAlpha3);
  const json: JSON = await JSON.parse(response);

  return json;
}

export default {
  UserDetail,
  Login,
  getCountryGeometry,
};
