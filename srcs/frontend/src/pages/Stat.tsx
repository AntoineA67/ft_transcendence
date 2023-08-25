import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { useState, useEffect } from 'react';

import '../styles/Stat.css';

function HistoryContent() {
	const data = ['', '', '', '']
	
	
	return (
		<>
		</>
	);
}

function AchieveContent({achieve}: {achieve: string[]}) {
	
	return (
		<ul className="tab-ul px-sm-5 py-5">
			{achieve.map((value: string, index : number) => {
				return(
					index % 2 ? (
						<li className='tab-item' style={{ backgroundColor: "transparent" }}> {value} </li>
					) : (
						<li className='tab-item'> {value} </li>
					)
				)
			})}
			<p style={{color: "red", textAlign: "center"}}>more</p>
		</ul>
	);
}

function PieChart() {

}

export default function Stat() {
	const [show, setShow] = useState<'history' | 'achieve'>('history');
	const achieve = ['Never missed a match', 'Win 10 rounds!', 'Win 50 rounds!', 'Logged in everyday this week']
	
	useEffect(() => {
		let history = document.getElementById('history');
		let achieve = document.getElementById('achieve');
		if (!history || !achieve) return ;
		history.classList.toggle("tab-greyout");
		achieve.classList.toggle("tab-greyout");
	}, [show]);

	return (
		<>
			{/* small screen  */}
			<Container className="mb-5 pb-5 d-sm-none" 
				style={{color: "white", border: "1px solid white"}}>
				<div className="row">
					<div className="col-6">
						<h5 className="tab-main-color tab-greyout" id="history" 
							onClick={(e) => (setShow('history') )}> 
							History
						</h5>
					</div>

					<div className="col-6">
						<h5 className="tab-main-color" id="achieve"
							onClick={() => setShow('achieve')}>
							Achieve.
						</h5>
					</div>
				</div>
				{show == 'achieve' && <AchieveContent achieve={achieve} />}
				{show == 'history' && <div>history content</div>}
			</Container>

			{/* big screan */}
			<Container className="d-none d-sm-block"
				style={{ color: "white", border: "1px solid white" }}>
				<div className="row">
					<div className="col-6">
						<h5 className="tab-main-color"> 
							History
						</h5>
						<div>
							history content
						</div>
					</div>

					<div className="col-6">
						<h5 className="tab-main-color">
							Achievement
						</h5>
						<div>
							{<AchieveContent achieve={achieve} />}
						</div>
					</div>
				</div>
			</Container>
		</>
	);
	
}
