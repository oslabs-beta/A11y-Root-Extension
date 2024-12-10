import React, { useState, useEffect } from 'react';
import './style.css';
import HeaderContainer from './containers/HeaderContainer';
import MainContainer from './containers/MainContainer';
import { Types } from 'mongoose';
import { postMessage } from './helpers/vscodeHelper';
import {User, EventData} from './types'
//import * as vscode from 'vscode';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  //how to handle information received from the extension (as EventData)
  function globalMessageHandler(event: MessageEvent) {
    const { command, message } = event.data as EventData;
    switch (command) {
      case 'loggedIn':
        setIsLoggedIn(true);
        setUser(message);
        break;
      case 'loggedOut':
        setIsLoggedIn(false);
        setUser(null);
        break;
      case 'error':
        //add a default error handler here for how webview handles "errors" from extension
      default:
        console.warn('Unknown command received:', command);
    }
  }
  //listens for information from the extension
  window.addEventListener('message', globalMessageHandler);

  //on webview load, check if a user ssid exists in secret memory. if they do, we want to persist their login status
  useEffect(() => {
    postMessage({command:'checkLogin'});
  },[])



  return (
    // header container that has login/logout and or session status such as username
    //if we are logged in and have user details, display the main container.
    <div>
      <h1>A11y Root Webview</h1>
      <p>Welcome to the A11y Root VS Code extension!</p>
      <HeaderContainer
        user={user}
        isLoggedIn={isLoggedIn}
      />
      {(isLoggedIn && user) ? (<MainContainer user={user}/>): <></>}
    </div>
  );
};

export default App;
