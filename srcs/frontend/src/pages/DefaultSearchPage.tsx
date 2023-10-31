import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup} from '@fortawesome/free-solid-svg-icons';

export function DefaultSearchPage() {
	return (
		<div className='d-flex flex-column justify-content-center align-items-center w-100 h-100'>
			<FontAwesomeIcon icon={faUserGroup} size='2xl' style={{color: "grey",}} />
			<p className='grey-text p-3'>Select a user</p>
		</div>
	)
}
