export interface UserIcon {
	login: string;
	avatarUrl: string;
}
export interface UserInfo extends UserIcon {
	id: number;
	name: string | null;
}
