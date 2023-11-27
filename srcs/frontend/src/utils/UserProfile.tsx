// import '../styles/index.css'

import { profileType } from "../../types/user";
import { Avatar } from "./Avatar";
import Stat from "../pages/Stat";
import { useParams, useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import { Options } from "./Options";
import { GoUp } from './GoUp'

export function UserProfile() {
	const { userNick } = useParams();
	const loaderData = useLoaderData() as profileType;
	const [profile, setProfile] = useState<profileType>(loaderData);

	useEffect(() => {
		setProfile(loaderData);
	}, [userNick, loaderData])

	return (
		<>
			{/* {location.pathname.startsWith('/friends/')
				&& !profile.friend && <Navigate to={`/search/${userNick}`} replace={true} />} */}
			<div className='w-100 h-100 d-flex flex-column align-items-center'>
				<GoUp />
				<div
					className="container my-5 pb-sm-5 d-flex flex-column align-items-center white-text">

					<div>
						<Avatar size={150} user={{
							id: profile.id,
							username: profile.username,
							avatar: profile.avatar,
							status: profile.status
						}} />
					</div>

					<h5 className='my-3 white-text'>
						{profile.username}
					</h5>

					<div className='w-75'>
						<p className='white-text text-center'>
							{profile.bio}
						</p>
					</div>
				</div>
				<Options profile={{ ...profile }} setProfile={setProfile} />
				<Stat gameHistory={profile.gameHistory.map((a) => ({ ...a }))} achieve={{ ...(profile.achieve) }} />

			</div>
		</>
	)
}




