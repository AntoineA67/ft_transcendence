import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet } from "react-router-dom";


import Form from 'react-bootstrap/Form';

export function Search() {
	return (
		<>


			<Form.Control type="text" placeholder="Search anything" />
			<Outlet />
		</>
	)
}