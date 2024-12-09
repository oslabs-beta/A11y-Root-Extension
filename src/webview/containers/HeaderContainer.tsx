import React, { useDeferredValue } from 'react';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import UserInfo from '../components/UserInfo';
import { Types } from 'mongoose';

// Define the TypeScript interface for the User schema
interface User {
  githubId: string; // Required and unique
  username: string; // Required
  profileUrl?: string; // Optional
  avatarUrl?: string; // Optional
  projects?: Types.ObjectId[]; // References to Project documents
}

interface HeaderContainerProps {
  user: User | null;
  isLoggedIn: boolean; // Indicates if the user is logged in
}

function HeaderContainer({
  user,
  isLoggedIn,
}: HeaderContainerProps) {
  //command message to check global storage for if user is logged in

  //if user is logged in, show username and logout button. else show login button.
  //buttons do not directly set state, but rather post a message to the extension which handles state and globalmemory logic
  return (
    <header>
      {(isLoggedIn && user) ? (
        <div>
          <UserInfo username={user.username} />
          <LogoutButton/>
        </div>
      ) : (
        <LoginButton/>
      )}
    </header>
  );
}

export default HeaderContainer;
