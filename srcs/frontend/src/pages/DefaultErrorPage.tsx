import { useRouteError } from "react-router-dom";

export function DefaultErrorPage() {
	const error = useRouteError() as Response;
	console.error(error);

	return (
		<div className='container-fluid'>
			<h5 className='white-text text-center mt-5'>
				{error.status}
				<br />
				{error.statusText}
			</h5>
			<h5 className='white-text text-center mt-2'>
				Something went wrong
			</h5>
		</div>
	)
}