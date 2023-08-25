import '../styles/App.css';
import '../styles/Profile.css';

import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import { useUser } from './Sidebar';

import Container from 'react-bootstrap/Container';


type textProp = {
	type: 'nick' | 'bio',
	content: string,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}

function Text({ type, content, setEdit }: textProp) {
	return (
		<>
			<p style={{ color: "white"}} className="mt-3 w-50 text-center text-wrap text-break">{content}</p>
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
		const fetchObj = {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(content)
		}
		try {
			//different url for differnt type (nick / bio) perhaps ?
			const response = await fetch('', fetchObj);
			if (!response.ok) throw Error('response not ok');
		} catch (err: any) {
			console.log(err)
		} finally {
			//check response
			setContent(mod);
			setEdit('done');
		}
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

	function autoUpload() {
		const form = document.getElementById('form-avatar') as HTMLFormElement;
		const input = document.getElementById('new-avatar') as HTMLInputElement;
		if (form) {
			form.submit();
			input.value = '';
		}
	}

	return (
		<form id='form-avatar' action='link' method="post" encType="multipart/form-data">
			<label htmlFor="new-avatar" className='add' style={{ position: "relative", bottom: "40px", left: "30px" }}>
				<input className='d-none' id="new-avatar" type="file" name="new-avatar" onChange={autoUpload}/>
			</label>
		</form>
	);
}

function Profile() {
	const { nickname, bio, avatar, setNickname, setBio, setAvatar } = useUser();
	const [edit, setEdit] = useState<'done' | 'nick' | 'bio'>('done');

	return (
		<Container className="my-5 d-flex flex-column align-items-center" style={{ color: "white", border: "2px solid white" }}>			
			<Link to="setting"><button className="setting m-3 position-absolute top-0 end-0" /></Link>

			<img alt="avatar" src={avatar} className="my-3"
				style={{ minHeight: "100px", minWidth: "100px",  borderRadius: "50%", border: "1px solid white" }} />
			
			<NewAvatar />

			{edit == 'nick' ?
				<EditText type={'nick'} content={nickname} setContent={setNickname} setEdit={setEdit} />
				: <Text type={'nick'} content={nickname} setEdit={setEdit} />}
			
			{edit == 'bio' ?
				<EditText type={'bio'} content={bio} setContent={setBio} setEdit={setEdit} />
				: <Text type={'bio'} content={bio} setEdit={setEdit} />}

		</Container>
	);
}

export default Profile;