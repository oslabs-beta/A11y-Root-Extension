import React, { useState, useEffect } from 'react';
import './style.css';
import HeaderContainer from './containers/HeaderContainer';
import MainContainer from './containers/MainContainer';
import { Types } from 'mongoose';

//import * as vscode from 'vscode';

interface User {
  githubId: string; // Required and unique
  username: string; // Required
  profileUrl?: string; // Optional
  avatarUrl?: string; // Optional
  projects?: Types.ObjectId[]; // References to Project documents
}

interface EventData {
  command: string;
  username: string;
}

// const userSchema = new Schema({
//   githubId: { type: String, required: true, unique: true },
//   username: { type: String, required: true },
//   profileUrl: String,
//   avatarUrl: String,
//   projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
// });

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // username used for testing, can get full github data back by updating what is returned in extension.ts
  const [username, setUsername] = useState<string>('');

  function globalMessageHandler(event: MessageEvent) {
    const { command, username } = event.data as EventData;
    switch (command) {
      case 'loggedIn':
        setIsLoggedIn(true);
        setUsername(username);
        break;
      default:
        console.warn('Unknown command received:', command);
    }
  }

  // }
  window.addEventListener('message', globalMessageHandler);
  useEffect(() => {
    window.addEventListener('message', globalMessageHandler);
  }, [isLoggedIn]);

  // project

  return (
    // header container that has login/logout and or session status such as username
    //
    <div>
      <h1>A11y Root Webview</h1>
      <p>Welcome to the A11y Root VS Code extension!</p>
      <HeaderContainer
        user={user}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
      />
      <MainContainer />
    </div>
  );
};

export default App;
