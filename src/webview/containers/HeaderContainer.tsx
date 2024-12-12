import React, { useDeferredValue } from 'react';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import UserInfo from '../components/UserInfo';
import { Types } from 'mongoose';
import { HeaderContainerProps } from '../types';

function HeaderContainer({
  user,
  isLoggedIn,
  isCheckingLogin,
}: HeaderContainerProps) {
  //command message to check global storage for if user is logged in

  //if user is logged in, show username and logout button. else show login button.
  //buttons do not directly set state, but rather post a message to the extension which handles state and globalmemory logic
  return (
    <header id='header'>
      <h1>A11y Root</h1>
      {isCheckingLogin && '...loading'}
      {!isCheckingLogin && isLoggedIn && user && (
        <div id='logged-in'>
          <UserInfo username={user.username} />
          <LogoutButton />
        </div>
      )}
      {!isCheckingLogin && !isLoggedIn && <LoginButton />}
    </header>
  );
}

export default HeaderContainer;
