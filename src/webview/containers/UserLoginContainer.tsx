import React from 'react';
import GitHubIcon from '../components/GitHubIcon';
import UserInfo from '../components/UserInfo';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';

import { UserLoginContainerProps } from '../types';

function UserLoginContainer({ isLoggedIn, user }: UserLoginContainerProps) {
  return (
    <section id='user-login'>
      <GitHubIcon />

      {isLoggedIn && user ? (
        <div id='logged-in'>
          <UserInfo username={user.username} />
          <LogoutButton />
        </div>
      ) : (
        <div id='logged-out'>
          <LoginButton />
        </div>
      )}
    </section>
  );
}

export default UserLoginContainer;
