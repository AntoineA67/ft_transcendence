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


type textProp = {
	type: 'nick' | 'bio',
	content: string,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}

function Text({ type, content, setEdit }: textProp) {
	const classname = "mt-3 w-50 text-center text-wrap text-break";
	
	return (
		<>
			{type == 'nick' ? (
				<h5 style={{ color: "white"}} className={classname}>
					{content}
				</h5>
			) : (
				<p style={{ color: "white" }} className={classname}>
					{content}
				</p>
			)}
			<button className="edit-pen" onClick={() => setEdit(type)} />
		</>
	);
}

type editTextProp = {
	type: 'nick' | 'bio',
	content: string,
	setContent: React.Dispatch<React.SetStateAction<string>>,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}

function EditText({ type, content, setContent, setEdit }: editTextProp) {
	const [mod, setMod] = useState(content);
	
	useEffect(() => {
		const el = document.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
		el.style.height = (el.scrollHeight) + "px";
	}, [mod]);
	
	useEffect(() => {
		const el = document.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
		el.setSelectionRange(el.value.length, el.value.length);
	}, []);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>, type: string, content: string) {
		e.preventDefault();
		if (mod == content) {
			setEdit('done');
			return ;
		}
		let data = (type == 'nick') ? {username: mod} : {bio: mod};
		socket.emit('UpdateProfile', data, (success: boolean) => {
			success && setContent(mod);
		})
		setEdit('done');
	}

	return (
		<form className="my-3 w-50 d-flex flex-column align-items-center" 
			onSubmit={(e) => handleSubmit(e, type, content)}>
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
		if (file.size >= 1073741824) {
			console.log('file size limit: 1GB');
			return ;
		}
		let data = new FormData();
		data.append('avatar', file);
		try {
			const response = await fetch('http://localhost:3000/users/avatar', {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					'Accept': 'application/json'
				},
				body: data
			});
			if (!response.ok) { throw new Error('response not ok') }
		} catch (err: any) {
			console.log('err autoUpload: ', err);
		}
		//rerender the page to refetch avatar
	}

	return (
		<form id='form-avatar' action='link' method="post" encType="multipart/form-data">
			<label htmlFor="new-avatar" className='add' style={{ position: "relative", bottom: "40px", left: "30px" }}>
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

type Profile = {
	id: number,
	username: string,
	avatar: null,
	status: 'ONLINE' | 'OFFLINE' | 'INGAME',
	bio: string,
}

function Profile() {
	const [nickname, setNickname] = useState('');
	const [bio, setBio] = useState('');
	const [avatar, setAvatar] = useState('') //base 64 string
	const [edit, setEdit] = useState<'done' | 'nick' | 'bio'>('done');

	useEffect(() => {
		socket.emit('MyProfile', (response: Profile) => {
			setNickname(response.username);
			setBio(response.bio);
		})
		//fetch avatar
	}, []);

	return (
		<>
			<Container className="my-5 pb-sm-5 d-flex flex-column align-items-center" 
				style={{ color: "white"}}>			
				<Link to="/setting"><button className="setting m-3 position-absolute top-0 end-0" /></Link>
				
				<img 
					src={`data:image/jpeg;base64,${avatar}`} 
					className="my-3"
					style={{ minHeight: "100px", minWidth: "100px",  borderRadius: "50%", border: "1px solid white" }} 
				/>
				<NewAvatar />

				{edit == 'nick' ?
					<EditText type={'nick'} content={nickname} setContent={setNickname} setEdit={setEdit} />
					: <Text type={'nick'} content={nickname} setEdit={setEdit} />}
				
				{edit == 'bio' ?
					<EditText type={'bio'} content={bio} setContent={setBio} setEdit={setEdit} />
					: <Text type={'bio'} content={bio} setEdit={setEdit} />}

			</Container>
			<Stat></Stat>
		</>
	);
}

export default Profile;