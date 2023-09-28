import { profileType } from "../../types/user";
import { Avatar } from "./Avatar";
import Stat from "../pages/Stat";
import { Navigate, useLocation, useParams } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { useEffect, useState } from "react";
import { socket } from "./socket";


export function UserProfile() {
	const { friendNick } = useParams();
	const location = useLocation();
	const [ profile, setProfile ] = useState<profileType | null>(null);

	
	useEffect(() => {
		socket.emit('Profile', friendNick, (res: profileType) => {
			setProfile(res)
		})
	}, [friendNick])
	
	return (
		<>
			{ !profile &&  <p style={{color: 'white'}}>loading</p> }
			{ profile && location.pathname.startsWith('/friends/')
				&& !profile.friend && <Navigate to={`/search/`} replace={true} /> }
			{ profile && 
				<>
					<Container 
						className="my-5 pb-sm-5 d-flex flex-column align-items-center"
						style={{ color: "white" }}>	

						<Avatar size={150} user={{
							id: profile.id,
							username: profile.username,
							avatar: profile.avatar,
							status: profile.status
						}} />

						<h5 style={{ color: "white" }}>
							{profile.username}
						</h5>

						<p style={{ color: "white" }}>
							{profile.bio}
						</p>
					</Container>
					<Option/>
					<Stat></Stat>
				</>
			}
		</>
	)
}

function Option() {
	
	return (
		<div className='' style={{color: 'white'}}>
			Add chat pong block etc
		</div>
	)
}