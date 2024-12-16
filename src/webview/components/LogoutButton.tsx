import React from 'react';
import { postMessage } from '../helpers/vscodeHelper';

function LogoutButton() {
  const handleClick = () => {
    //postmessage command beginLogout
    postMessage({ command: 'beginLogout' });
  };
  return (
    <div className='logout-button'>
      <button onClick={handleClick}>Logout</button>
    </div>
  );
}

export default LogoutButton;
