import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { useState, useEffect } from 'react';
import Winner from '../assets/winner.svg';

import '../styles/Stat.css';

type match = {
	date: string,
	who: string, 
	result: string,
	win: boolean,
}

// 'more' fetch more data on click, data will be put in a useState
function HistoryContent() {

	const data : match[] = [
		{date: '4 days ago', who: 'Birb', result: '3:2', win: true}
		, { date: '2 weeks ago', who: 'LooooooooongCat', result: '2:3', win: false}
		, { date: '2/4', who: 'LooooooooongCat', result: '5:3', win: true}
		, { date: '2/5', who: 'someone', result: '2:113', win: false}];

	const listItem = ({date, who, result, win}: match, index: number) => {
		// const extraInfo = date + ' ' + who + ' ' + (win ? 'win' : 'lose');
		const classname = index % 2 ? 'history-item':'history-item-transparent';
		const color = win ? 'text-magenta' : 'text-cyan';

		return (
			<li key={index}
				// title={extraInfo} 
				className={`${classname} d-flex flex-wrap`}>
				<div>{date}</div>
				<div className='ms-auto me-3'> {who} </div>
				<div className={color}> {result} </div>
			</li>
		);
	}
	
	return (
		<ul className="tab-ul px-sm-5 py-5">
			{data.map(listItem)}
			<p style={{ color: "red", textAlign: "center" }}>more</p>
		</ul>
	);
}

function AchieveContent() {
	const achieve = ['Never missed a match', 'Win 10 rounds!', 'Win 50 rounds!', 'Logged in everyday this week'];

	const listItem = (value: string, index: number) => {
		const classname = index % 2 ?'achieve-item':'achieve-item-transparent';
		return (
			<li key={index}
				className={classname}>
				{value}
			</li>
		);
	};

	return (
		<ul className="tab-ul px-sm-5 py-5">
			{achieve.map(listItem)}
			<p style={{color: "red", textAlign: "center"}}>more</p>
		</ul>
	);
}

function PieChart() {

}

export default function Stat() {
	const [show, setShow] = useState<'history' | 'achieve'>('history');
	
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
				{show == 'achieve' && <AchieveContent />}
				{show == 'history' && <HistoryContent></HistoryContent>}
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
							<HistoryContent></HistoryContent>
						</div>
					</div>

					<div className="col-6">
						<h5 className="tab-main-color">
							Achievement
						</h5>
						<div>
							{<AchieveContent />}
						</div>
					</div>
				</div>
			</Container>
		</>
	);
	
}
