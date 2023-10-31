import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup} from '@fortawesome/free-solid-svg-icons';

export function DefaultFriendPage() {
	return (
		<div className='d-flex justify-content-center align-items-center w-100 h-100'>
			<FontAwesomeIcon icon={faUserGroup} size='2xl' style={{color: "grey",}} />
		</div>
	)
}
