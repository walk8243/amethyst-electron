import { Avatar } from '@mui/material';
import type { UserInfo } from '../../types/User';
import { useState, useEffect } from 'react';

export const GithubAvatar = ({ user }: { user: UserInfo }) => {
	const [icon, setIcon] = useState<string>('');
	useEffect(() => {
		window.electron?.proxyContent(user.avatarUrl).then((icon) => {
			setIcon(Buffer.from(icon).toString('base64'));
		});
	}, []);

	return (
		<Avatar sx={{ width: 60, height: 60 }}>
			<img src={`data:image/jpeg;base64,${icon}`} alt={user.login} />
		</Avatar>
	);
};
