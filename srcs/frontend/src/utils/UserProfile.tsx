import { userType } from "../../types/user";
import { Avatar } from "./Avatar";
import Stat from "../pages/Stat";
import { useLocation, useParams } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { useEffect } from "react";



export function UserProfile() {
	const { username } = useParams();
	const location = useLocation();

	useEffect(() => {
		// get user, relationship
		// location might be search or friend
		console.log(location);
		location.pathname.startsWith('/friends/');
	}, [])
	return (
		<>
			<Container 
				className="my-5 pb-sm-5 d-flex flex-column align-items-center"
				style={{ color: "white" }}>	

				{/* <Avatar size={150} user={user} /> */}

				<h5 style={{ color: "white" }}>
					username
				</h5>

				<p style={{ color: "white" }}>
					user bio
				</p>
			</Container>
			<Option/>
			<Stat></Stat>
		</>
	)
}

function Option() {
	
	return (
		<div style={{border: '1px solid red', color: 'white'}}>
			Add chat pong block etc
		</div>
	)
}