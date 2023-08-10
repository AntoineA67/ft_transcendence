import leftArr from '../assets/leftArrow.svg';
import '../styles/Login.css'; 

type LeftArrowProps = {
	setPage: React.Dispatch<React.SetStateAction<string>>,
	goToPage: string,
}

function LeftArrow({setPage, goToPage}:LeftArrowProps) {
	return (
		<button className="leftArrow" onClick={() => setPage(goToPage)}>
			<img src={`${leftArr}`}></img>
		</button>
	);
}

export default LeftArrow;