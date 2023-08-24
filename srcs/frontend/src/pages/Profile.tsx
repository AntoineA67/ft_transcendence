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

function Text({type, content, setEdit}: textProp) {
	return (
		<form className="my-3" style={{color: "white"}}>
			<label htmlFor={`edit-${type}`}></label>
			<input id={`edit-${type}`} readOnly className="form-control-plaintext" 
				value={content} style={{color: "white"}}></input>
			<button className="edit-pen" onClick={() => setEdit(type)}/>
		</form>
	);
}

type editTextProp = {
	type: 'nick' | 'bio',
	content: string,
	setContent: React.Dispatch<React.SetStateAction<string>>,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "done" | "nick">>,
}

function EditText({type, content, setContent, setEdit}: editTextProp) {
	const [mod, setMod] = useState(content);
	
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>, type: string, content: string) {
		e.preventDefault();
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
			//if response ok, update
			//if not do nothing
			setContent(mod);
			setEdit('done');
		}
	}
	
	return (
		<form className="my-3" onSubmit={(e) => handleSubmit(e, type, content)}>
			<label htmlFor={`edit-${type}`}></label>
			<input id={`edit-${type}`} value={mod} onChange={(e) => setMod(e.target.value)}></input>
			<button type="submit" className="ok"/>
		</form>
	);

}

function Profile() {
	const { nickname, bio, avatar, setNickname, setBio, setAvatar } = useUser();
	const [edit, setEdit] = useState<'done' | 'nick' | 'bio'>('done');

	return (
		<Container className="my-5 d-flex flex-column align-items-center" style={{color: "white", border: "2px solid white"}}>
			<div className="position-absolute top-0 end-0">
				<Link to="."><button className="setting"/></Link>
			</div>

			<img alt="avatar" src={avatar}
				style={{height: "100px", width: "100px", borderRadius: "50%", border: "1px solid white"}} />
			
			<div>
				{edit == 'nick' ?
					 <EditText type={'nick'} content={nickname} setContent={setNickname} setEdit={setEdit}/>
					: <Text type={'nick'} content={nickname} setEdit={setEdit} />} 
			</div>

			<div>
				{edit == 'bio' ?
					<EditText type={'bio'} content={bio} setContent={setBio} setEdit={setEdit}/>
					: <Text type={'bio'} content={bio} setEdit={setEdit} /> }
			</div>

		</Container>
	);
}

export default Profile;