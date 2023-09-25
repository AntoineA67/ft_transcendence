import '../styles/App.css';
import '../styles/Profile.css';

import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { socket } from '../utils/socket';
import Stat from './Stat';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { arrayBuffer } from 'stream/consumers';
import { profileType } from '../../types/user';
import { Avatar } from '../utils/Avatar';


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
				<h5 style={{ color: "white"}} className={classname}>
					{profile.username}
				</h5>
			) : (
				<p style={{ color: "white" }} className={classname}>
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
	setProfile: React.Dispatch<React.SetStateAction<profileType | null>>,
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
		setProfile: React.Dispatch<React.SetStateAction<profileType | null>>
		) {
		const content = (type == 'nick') ? profile.username : profile.bio;
		const obj = (type == 'nick') ? { username: content } : { bio: content };
		e.preventDefault();
		if (mod == content) {
			setEdit('done');
			return ;
		}
		let data = (type == 'nick') ? {username: mod} : {bio: mod};
		socket.emit('UpdateProfile', data, (success: boolean) => {
			success && setProfile({... profile, ... obj});
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

function NewAvatar() {

	async function autoUpload() {
		const input = document.getElementById('new-avatar') as HTMLInputElement;
		const file = input.files ? input.files[0] : null;
		if (!file) return ;
		if (file.size >= 10485760) {
			console.log('file size limit: 10MB');
			return ;
		}
		socket.emit('newAvatar', file, (success: boolean) => {
			success ? console.log('success') : console.log('fail');
		})
	}

	return (
		<form id='form-avatar' action='link' method="post" encType="multipart/form-data">
			<label htmlFor="new-avatar" className='add' style={{ position: "relative", bottom: "40px", left: "50px" }}>
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
	const [profile, setProfile] = useState<profileType | null>(null);
	// const [nickname, setNickname] = useState('');
	// const [bio, setBio] = useState('');
	// const [avatar, setAvatar] = useState('') //base 64 string
	const [edit, setEdit] = useState<'done' | 'nick' | 'bio'>('done');

	useEffect(() => {
		socket.emit('MyProfile', (response: profileType) => {
			setProfile(response)
		})
	}, []);

	return (
		profile ? (
			<>
				<Container className="my-5 pb-sm-5 d-flex flex-column align-items-center" 
					style={{ color: "white"}}>			
					<Link to="/setting"><button className="setting m-3 position-absolute top-0 end-0" /></Link>
				
					<Avatar size={150} user={{
						id: profile.id, 
						username: profile.username, 
						avatar: profile.avatar,
						status: profile.status
						}} />
					<NewAvatar />

					{edit == 'nick' ?
						<EditText 
						type={'nick'} profile={profile} setProfile={setProfile} setEdit={setEdit} />
						: <Text type={'nick'} profile={profile} setEdit={setEdit} />}
					
					{edit == 'bio' ?
						<EditText type={'bio'} profile={profile} setProfile={setProfile} setEdit={setEdit} />
						: <Text type={'bio'} profile={profile} setEdit={setEdit} />}

				</Container>
				<Stat></Stat>
			</>
		) : (
			<p>loading</p>
		)
	);
}

export default Profile;