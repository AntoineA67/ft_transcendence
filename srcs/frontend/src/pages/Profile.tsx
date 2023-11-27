import { useState, useEffect } from 'react';
import { Link, useLoaderData } from "react-router-dom";
import Stat from './Stat';
import { socket } from '../utils/socket';
import { Avatar } from '../utils/Avatar';
import { profileType } from '../../types/user';
import { EnqueueSnackbar, enqueueSnackbar } from "notistack";
import { checkBio, checkUserRoomName } from './ChatDto';

type textProp = {
	type: 'nick' | 'bio',
	profile: profileType,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}


function Text({ type, profile, setEdit }: textProp) {
	const classname = "mt-3 text-center";

	return (
		<div className='w-75'>

			{type === 'nick' ? (
				<h5 className={`${classname} white-text`}>
					{profile.username}
					<span>
						<button className="edit-pen" onClick={() => setEdit(type)} />
					</span>
				</h5>
			) : (
				<p className={`${classname} white-text`}>
					{profile.bio}
					<span>
						<button className="edit-pen" onClick={() => setEdit(type)} />
					</span>
				</p>
			)}
		</div>
	);
}


type editTextProp = {
	type: 'nick' | 'bio',
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType>>,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
	enqueueSnackbar: EnqueueSnackbar,
}

function EditText({ type, profile, setProfile, setEdit, enqueueSnackbar }: editTextProp) {
	const [mod, setMod] = useState(type === 'nick' ? profile.username : profile.bio);

	useEffect(() => {
		const el = document.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
		el.style.height = (el.scrollHeight) + "px";
	}, [mod]);

	useEffect(() => {
		const el = document.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
		el.setSelectionRange(el.value.length, el.value.length);
	}, []);

	async function handleSubmit(
		e: React.FormEvent<HTMLFormElement>,
		type: string,
		profile: profileType,
		setProfile: React.Dispatch<React.SetStateAction<profileType>>
	) {
		const content = type === 'nick' ? profile.username : profile.bio;
		const obj = type === 'nick' ? { username: mod } : { bio: mod };
		e.preventDefault();

		if (mod === content) {
			setEdit('done');
			return;
		}

		if (type === 'nick' && !checkUserRoomName(mod, enqueueSnackbar, 'Username')) {
			return;
		}

		if (type === 'bio' && !checkBio(mod, enqueueSnackbar)) {
			return;
		}

		if (type === 'nick') {
			socket.emit('UpdateUsername', mod, (success: boolean) => {
				if (!success) return;
				setProfile((prev) => {
					if (prev) {
						if ('username' in obj && typeof obj.username === 'string') {
							return { ...prev, username: obj.username.trim() };
						}
						if ('bio' in obj && typeof obj.bio === 'string') {
							return { ...prev, bio: obj.bio.trim() };
						}
					}
					return prev;
				});
			})
		} else {
			socket.emit('UpdateBio', mod.trim(), (success: boolean) => {
				if (!success) return;
				setProfile((prev) => {
					if (prev) {
						if ('username' in obj && typeof obj.username === 'string') {
							return { ...prev, username: obj.username.trim() };
						}
						if ('bio' in obj && typeof obj.bio === 'string') {
							return { ...prev, bio: obj.bio.trim() };
						}
					}
					return prev;
				});
			})
		}
		setEdit('done');
	}

	return (
		<form className="my-3 w-50 d-flex flex-column align-items-center"
			onSubmit={(e) => handleSubmit(e, type, profile, setProfile)}>
			<label htmlFor={`edit-${type}`}></label>
			<textarea
				id={`edit-${type}`}
				className="w-100 text-center my-1 edit-text-area"
				autoFocus
				value={mod}
				onChange={(e) => {
					const text = e.target.value;
					if (text.length <= 201) {
						setMod(text);
					} else {
						enqueueSnackbar('Character count exceeds the limit (200 characters)', { variant: 'error' });
					}
				}}
				maxLength={201} // Set the maxLength to enforce the character limit
			></textarea>
			<button type="submit" className="ok" />
		</form>
	);
}

type NewAvatarProp = {
	setProfile: React.Dispatch<React.SetStateAction<profileType>>
}
function NewAvatar({ setProfile }: NewAvatarProp) {

	async function autoUpload() {
		const input = document.getElementById('new-avatar') as HTMLInputElement;
		const file = input.files ? input.files[0] : null;
		if (!file) return;
		if (file.size >= 1048576) {
			enqueueSnackbar("Oops, the photo size limit is 1 MB!", {
				variant: 'error',
				autoHideDuration: 3000,
			})
			return;
		}
		if (!/\.(png|jpg)$/i.test(file.name)) {
			enqueueSnackbar("Please upload a .png or .jpg file.", {
				variant: 'error',
				autoHideDuration: 3000,
			})
			return;
		}
		socket.emit('newAvatar', file, (success: boolean) => {
			if (!success) {
				enqueueSnackbar("Bad photo format !", {
					variant: 'error',
					autoHideDuration: 3000,
				})
				return;
			}
			socket.emit('myAvatar', (avatar: string) => {
				setProfile((prev) => ({ ...prev, avatar }))
			})
		})
	}

	return (
		<form id='form-avatar' action='link' method="post" encType="multipart/form-data">
			<label htmlFor="new-avatar" className='add new-avatar-pos' title="Max 1Mb">
				<input
					className='d-none'
					id="new-avatar"
					type="file"
					name="new-avatar"
					accept=".png, .jpg, .jpeg"
					onChange={autoUpload}
				/>
			</label>
		</form>
	);
}

function Profile() {
	const [profile, setProfile] = useState<profileType>(useLoaderData() as profileType);
	const [edit, setEdit] = useState<'done' | 'nick' | 'bio'>('done');

	return (
		<>
			<div className="container-fluid my-5 pb-sm-5 d-flex flex-column align-items-center white-text " >
				<Link to="setting"><button className="setting m-3 position-absolute top-0 end-0" /></Link>

				<div>
					<Avatar size={150} user={{
						id: profile.id,
						username: profile.username,
						avatar: profile.avatar,
						status: profile.status
					}} />
				</div>
				<NewAvatar setProfile={setProfile} />

				{(edit === 'nick'
				) ? (
					<EditText type='nick' profile={profile} setProfile={setProfile} setEdit={setEdit} enqueueSnackbar={enqueueSnackbar} />
				) : (
					<Text type='nick' profile={profile} setEdit={setEdit} />)}

				{(edit === 'bio'
				) ? (
					<EditText type='bio' profile={profile} setProfile={setProfile} setEdit={setEdit} enqueueSnackbar={enqueueSnackbar} />
				) : (
					<Text type='bio' profile={profile} setEdit={setEdit} />)}
			</div>
			<Stat gameHistory={profile.gameHistory.map((a) => ({ ...a }))} achieve={{ ...(profile.achieve) }} />
		</>
	);
}

export default Profile;
