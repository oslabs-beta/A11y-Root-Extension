import React, { useDeferredValue } from 'react';
import { HeaderContainerProps } from '../../types/index.types';
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
