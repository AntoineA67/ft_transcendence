import { profileType } from "../../types/user";
import { Avatar } from "./Avatar";
import Stat from "../pages/Stat";
import { Navigate, useLocation, useParams, useLoaderData } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { useEffect, useState } from "react";
import { socket } from "./socket";
import { Options } from "./Options";
import { GoUp } from './GoUp'

export function UserProfile() {
	// const { userNick } = useParams();
	const location = useLocation();
	const loadProfile = useLoaderData() as profileType;
	const [profile, setProfile] = useState<profileType>(loadProfile);
	// const [loading, setLoading] = useState<boolean>(true);


	// useEffect(() => {
	// 	setLoading(true);
	// 	socket.emit('Profile', userNick, (res: profileType | null) => {
	// 		setProfile(res)
	// 		setLoading(false);
	// 		console.log('res', res)
	// 	})
	// }, [userNick])

	useEffect(() => {
		console.log('loadProfile: ', loadProfile);
	}, [])

	return (
		<>
			{/* {!loading && !profile && <p style={{ color: 'white' }}>User not found</p>} */}
			{/* {!profile && loading && <p style={{ color: 'white' }}>loading</p>} */}
			{profile && location.pathname.startsWith('/friends/')
				&& !profile.friend && <Navigate to={`/search/${profile.username}`} replace={true} />}
			{profile &&
				<div className='w-100 h-100 d-flex flex-column align-items-center'>
					<GoUp />
					<Container
						className="my-5 pb-sm-5 d-flex flex-column align-items-center"
						style={{ color: "white" }}>

						<div>
							<Avatar size={150} user={{
								id: profile.id,
								username: profile.username,
								avatar: profile.avatar,
								status: profile.status
							}} />
						</div>

						<h5 className='my-3' style={{ color: "white" }}>
							{profile.username}
						</h5>

						<p style={{ color: "white" }}>
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




