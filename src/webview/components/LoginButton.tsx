import React from 'react';

const vscode = acquireVsCodeApi();

interface LoginButtonProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

function LoginButton({ isLoggedIn, setIsLoggedIn }: LoginButtonProps) {
  const handleClick = () => {
    //postmessage command Oauth
    vscode.postMessage({ command: 'beginOAuth' });
    // //assuming that goes according to plan,
    // setIsLoggedIn(true);

    // //if it doesn't go well, don't change login state, error message here
  };
  return (
    <div className='login-button'>
      <button onClick={handleClick}>Login</button>
    </div>
  );
}

export default LoginButton;
