import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet } from "react-router-dom";


import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';

export function SearchBar() {
	return (
		<div className='d-flex w-100 align-items-center' style={{ backgroundColor: "black"}}>
			<Link to=".."><button className='goBack'></button></Link>
			<Form.Control type="text" placeholder="Search anything" />
		</div>
	);
}

export function Search() {
	return (
		<>

<Container fluid className='px-0 h-75'>
			<SearchBar />


			<Outlet />

			</Container>
		</>
	)
}