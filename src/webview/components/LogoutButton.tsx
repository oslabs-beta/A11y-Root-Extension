import React from 'react';

interface LogoutButtonProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

function LogoutButton({ isLoggedIn, setIsLoggedIn }: LogoutButtonProps) {
  const handleClick = () => {
    //postmessage command beginLogout
    //vscode.postMessage({ command: 'beginLogout' }); //need to implement this in extension.ts

    //assuming it goes according to plan
    setIsLoggedIn(false);

    //else error: cannot log out try again
  };
  return (
    <div className='logout-button'>
      <button onClick={handleClick}>Logout</button>
    </div>
  );
}

export default LogoutButton;
