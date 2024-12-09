import React from 'react';
import { postMessage } from '../helpers/vscodeHelper';

function LoginButton() {
  const handleClick = () => {
    //begin oauth process on extension
    postMessage({ command: 'beginOAuth' });
  };
  return (
    <div className='login-button'>
      <button onClick={handleClick}>Login</button>
    </div>
  );
}

export default LoginButton;
