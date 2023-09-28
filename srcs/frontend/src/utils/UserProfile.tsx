import { profileType } from "../../types/user";
import { Container } from "react-bootstrap/lib/Tab";
import { Avatar } from "./Avatar";
import Stat from "../pages/Stat";

type UserProfileProp = {
	profile: profileType;
}

export function UserProfile({ profile }: UserProfileProp) {
	return (
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
			<Option profile={profile} />
			<Stat></Stat>
		</>
	)
}

function Option({ profile }: UserProfileProp) {
	
	
	
	return (
		<div style={{border: '1px solid red'}}>
			{/* four button with socket event */}
		</div>
	)
}