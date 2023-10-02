import { Link } from "react-router-dom";

export function GoUp() {
	return (
		<Link to='..' style={{marginRight: 'auto'}}>
			<button className='goBack' />
		</Link>
	)
}