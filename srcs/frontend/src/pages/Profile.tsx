import '../styles/App.css';
import '../styles/Profile.css';

import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import { useUser } from './Sidebar';

import Container from 'react-bootstrap/Container'; 
import EditPen from '../assets/EditPen.svg';
import Setting from '../assets/setting.svg';

type textProp = {
	type: 'nick' | 'bio',
	content: string,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "no" | "nick">>,
}

function Text({type, content, setEdit}: textProp) {
	return (
		<div>
			<p className="text-center text-break my-3" style={{color: "white"}}>
				{content}
			</p>
			<button className="edit-pen" onClick={() => setEdit(type)} />
		</div>
	);
}

type editTextProp = {
	type: 'nick' | 'bio',
	content: string,
	setContent: React.Dispatch<React.SetStateAction<string>>,
	setFinal: React.Dispatch<React.SetStateAction<string>>,
	setEdit: React.Dispatch<React.SetStateAction<"bio" | "no" | "nick">>,
}

function EditText({type, content, setContent, setFinal, setEdit}: editTextProp) {
	
	

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
			//for now simply update
			setFinal(content);
			setEdit('no');
		}
	}
	
	return (
		<form onSubmit={(e) => handleSubmit(e, type, content)}>
			<label htmlFor="editing">hi</label>
			<input id="editing" value={content} onChange={(e) => setContent(e.target.value)}></input>
			<button type="submit" className="ok"/>
		</form>
	);

}

function Profile() {
	const { nickname, bio, avatar, setNickname, setBio, setAvatar } = useUser();
	const [text, setText] = useState('');
	const [edit, setEdit] = useState<'no' | 'nick' | 'bio'>('no');

	
	
	return (
		<Container className="my-5 d-flex flex-column align-items-center" style={{color: "white", border: "2px solid white"}}>
			<div className="position-absolute top-0 end-0">
				<Link to="."><button className="setting"/></Link>
			</div>

			<img alt="avatar" src={avatar}
				style={{height: "100px", width: "100px", borderRadius: "50%", border: "1px solid white"}} />
			
			<div>
				<label></label>
				<input id="nick" className="text-center input-profile" readOnly value={editnick} />
				<button id="edit-nick" className="edit-pen" onClick={() => edit('nick')} />
			</div>


			<input id="bio" className="text-center text-break" readOnly value={editbio} />			
			<button id="edit-bio" className="ok" onClick={() => edit('bio')} />

		</Container>
	);
}

export default Profile;