import React, { useDeferredValue } from 'react';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import UserInfo from '../components/UserInfo';
import { Types } from 'mongoose';
import { HeaderContainerProps } from '../types';
import GitHubIcon from '../components/GitHubIcon';
import UserLoginContainer from './UserLoginContainer';

function HeaderContainer({
  user,
  isLoggedIn,
  isCheckingLogin,
}: HeaderContainerProps) {
  return (
    <header id='header'>
      <h1>A11y Root</h1>
      {isCheckingLogin ? (
        '...loading'
      ) : (
        <UserLoginContainer isLoggedIn={isLoggedIn} user={user} />
      )}
    </header>
  );
}

export default HeaderContainer;
