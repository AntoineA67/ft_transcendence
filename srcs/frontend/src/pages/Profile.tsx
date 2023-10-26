import { useState, useEffect } from 'react';
import { Link, useLoaderData } from "react-router-dom";
import Stat from './Stat';
import { socket } from '../utils/socket';
import { Avatar } from '../utils/Avatar';
import { profileType } from '../../types/user';

type textProp = {
	type: 'nick' | 'bio',
	profile: profileType,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}

function Text({ type, profile, setEdit }: textProp) {
	const classname = "mt-3 w-50 text-center text-wrap text-break";
	
	return (
		<>
			{type == 'nick' ? (
				<h5 className={`${classname} white-text`}>
					{profile.username}
				</h5>
			) : (
				<p className={`${classname} white-text`}>
					{profile.bio}
				</p>
			)}
			<button className="edit-pen" onClick={() => setEdit(type)} />
		</>
	);
}

type editTextProp = {
	type: 'nick' | 'bio',
	profile: profileType,
	setProfile: React.Dispatch<React.SetStateAction<profileType>>,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}

function EditText({ type, profile, setProfile, setEdit }: editTextProp) {
	const [mod, setMod] = useState(type == 'nick' ? profile.username : profile.bio);
	
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
		type: string, profile: profileType, 
		setProfile: React.Dispatch<React.SetStateAction<profileType>>
	) {
		const content = (type == 'nick') ? profile.username : profile.bio;
		const obj = (type == 'nick') ? { username: mod } : { bio: mod };
		e.preventDefault();
		if (mod == content) {
			setEdit('done');
			return ;
		}
		let data = (type == 'nick') ? {username: mod} : {bio: mod};
		socket.emit('UpdateProfile', data, (success: boolean) => {
			// console.log('profile', profile)
			console.log('success: ', success)
			success && setProfile((prev) => (
				prev ? ({... prev, ... obj}) : prev
			));
		})
		setEdit('done');
	}

	return (
		<form className="my-3 w-50 d-flex flex-column align-items-center" 
			onSubmit={(e) => handleSubmit(e, type, profile, setProfile)}>
			<label htmlFor={`edit-${type}`}></label>
			<textarea id={`edit-${type}`} className="w-100 text-center my-1 edit-text-area" 
				autoFocus value={mod} onChange={(e) => setMod(e.target.value)}></textarea>
			<button type="submit" className="ok" />
		</form>
	);
}

type NewAvatarProp = {
	setUpdate: React.Dispatch<React.SetStateAction<boolean>>
}
function NewAvatar({ setUpdate }: NewAvatarProp) {

	async function autoUpload() {
		const input = document.getElementById('new-avatar') as HTMLInputElement;
		const file = input.files ? input.files[0] : null;
		if (!file) return ;
		if (file.size >= 1048576) {
			console.log('file size limit: 1MB');
			return ;
		}
		socket.emit('newAvatar', file, (success: boolean) => {
			success ? (setUpdate((prev) => (!prev))) : console.log('fail');
		})
	}

	return (
		<form id='form-avatar' action='link' method="post" encType="multipart/form-data">
			<label htmlFor="new-avatar" className='add new-avatar-pos'>
				<input 
					className='d-none' 
					id="new-avatar" 
					type="file" 
					name="new-avatar" 
					// accept="image/*"
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
	const [update, setUpdate] = useState<boolean>(true);
	// const profile: profileType = useLoaderData() as profileType;

	// useEffect(() => {	
	// 	socket.emit('MyProfile', (response: profileType) => {
	// 		setProfile(response)
	// 		console.log('Myprofile: ', response);
	// 	})
	// }, [update]);

	return (
		<>
			<div className="container my-5 pb-sm-5 d-flex flex-column align-items-center white-text">			
				<Link to="/setting"><button className="setting m-3 position-absolute top-0 end-0" /></Link>
			
				<div>
					<Avatar size={150} user={{
						id: profile.id, 
						username: profile.username, 
						avatar: profile.avatar,
						status: profile.status
					}} />
				</div>
				<NewAvatar setUpdate={setUpdate}/>

				{ (edit == 'nick'
					) ? ( 
						<EditText type='nick' profile={profile} setProfile={setProfile} setEdit={setEdit} /> 
					) : (
						<Text type='nick' profile={profile} setEdit={setEdit} /> )}
				
					{ (edit == 'bio'
					) ? (
						<EditText type='bio' profile={profile} setProfile={setProfile} setEdit={setEdit} />
					) : (
						<Text type='bio' profile={profile} setEdit={setEdit} />)}
			</div>
			<Stat gameHistory={profile.gameHistory.map((a) => ({...a}))} achieve={{... (profile.achieve)}} />
		</>
	);
}

export default Profile;