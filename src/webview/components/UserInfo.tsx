import React from 'react';

interface UserInfoProps {
  username: string;
}
function UserInfo({ username }: UserInfoProps) {
  return <span className='username'>{username}</span>;
}

export default UserInfo;
