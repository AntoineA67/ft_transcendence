import { Link } from "react-router-dom";

export function GoUp() {
	return (
		<Link to='..' className="me-auto">
			<button className='leftArrow m-2' />
		</Link>
	)
}