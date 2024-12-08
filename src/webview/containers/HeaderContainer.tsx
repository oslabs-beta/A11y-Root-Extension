import React from 'react';
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
  setIsLoggedIn: (loggedIn: boolean) => void; // Function to update login status
  username: string;
}

function HeaderContainer({
  user,
  isLoggedIn,
  setIsLoggedIn,
  username,
}: HeaderContainerProps) {
  //command message to check global storage for if user is logged in

  return (
    <header>
      {isLoggedIn ? (
        <div>
          <LogoutButton setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
          <UserInfo username={username} />
        </div>
      ) : (
        <LoginButton setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      )}
    </header>
  );
}

export default HeaderContainer;
