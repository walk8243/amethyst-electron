import { Avatar } from '@mui/material';
import type { UserIcon } from '../../types/User';
import { useState, useEffect } from 'react';

export const GithubAvatar = ({
	user,
	size,
}: {
	user: UserIcon;
	size: number;
}) => {
	const [icon, setIcon] = useState<string>('');
	useEffect(() => {
		window.electron?.proxyContent(user.avatarUrl).then((icon) => {
			setIcon(Buffer.from(icon).toString('base64'));
		});
	}, []);

	return (
		<Avatar sx={{ width: size, height: size }}>
			<img src={`data:image/jpeg;base64,${icon}`} alt={user.login} />
		</Avatar>
	);
};
