// import '../styles/index.css'

import { profileType } from "../../types/user";
import { Avatar } from "./Avatar";
import Stat from "../pages/Stat";
import { Navigate, useLocation, useParams } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { useEffect, useState } from "react";
import { socket } from "./socket";
import { Options } from "./Options";
import { GoUp } from './GoUp'

export function UserProfile() {
	const { userNick } = useParams();
	const location = useLocation();
	const [profile, setProfile] = useState<profileType | null>(null);


	useEffect(() => {
		socket.emit('Profile', userNick, (res: profileType) => {
			setProfile(res)
			console.log('res', res)
		})
	}, [userNick])

	return (
		<>
			{!profile && <p className='white-text'>loading</p>}
			{profile && location.pathname.startsWith('/friends/')
				&& !profile.friend && <Navigate to={`/search/${userNick}`} replace={true} />}
			{profile &&
				<div className='w-100 h-100 d-flex flex-column align-items-center'>
					<GoUp />
					<Container
						className="my-5 pb-sm-5 d-flex flex-column align-items-center white-text">

						<Avatar size={150} user={{
							id: profile.id,
							username: profile.username,
							avatar: profile.avatar,
							status: profile.status
						}} />

						<h5 className='my-3 white-text'>
							{profile.username}
						</h5>

						<p className='white-text'>
							{profile.bio}
						</p>
					</Container>
					<Options profile={{... profile}} setProfile={setProfile} />
					<Stat gameHistory={profile.gameHistory.map((a) => ({ ...a }))} achieve={{ ... (profile.achieve) }} />

				</div>
			}
		</>
	)
}




