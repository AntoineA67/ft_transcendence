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
	
	// fetch data
	const win = 300;
	const lose = 100;
	const total = win + lose;
	
	function gradientDoghnut(xc:number, yc:number, r:number) {
		
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		if (!canvas) return ;
		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if (!ctx) return ;
		
		const colors = ['#fa34c3', '#34fafa']; //magenta cyan
		const data = [win, lose];
		let start = (2 * Math.PI) * (-1 / 4);
		let gradient = null;
		let startColor = null;
		let	endColor = null;
		
		for (let i = 0; i < 2; i++) {
			let degree = (2 * Math.PI) * (data[i] / total);
			console.log(`${2 * Math.PI} ${data[i]}  ${total} ${degree}`);
			
			// x start / end of the next arc to draw
			let xStart = xc + Math.cos(start) * r;
			let xEnd = xc + Math.cos(start + degree) * r;
			// y start / end of the next arc to draw
			let yStart = yc + Math.sin(start) * r;
			let yEnd = yc + Math.sin(start + degree) * r;
			
			startColor = colors[i];
			endColor = colors[(i + 1) % colors.length];
			gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
			gradient.addColorStop(0, endColor);
			gradient.addColorStop(0.5, startColor);
			gradient.addColorStop(1.0, endColor);
			
			ctx.beginPath();
			ctx.strokeStyle = gradient;
			ctx.arc(xc, yc, r, start, start + degree, true);
			ctx.lineWidth = 10;
			ctx.stroke();
			ctx.closePath();

			start += degree;
		}
	}

	useEffect(() => gradientDoghnut(100, 100, 60), []);
	
	return (
		<Container className='my-5' 
			style={{border: '1px solid red', color: 'white'}}>
			<div className='row'>
				<div className='col'>
					<canvas id="canvas" width='200' height='200' style={{border: '1px solid white'}}></canvas>
				</div>
				<div className='col'>
					stat
				</div>
			</div>
		</Container>
	);
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
			<PieChart></PieChart>
			{/* small screen  */}
			<Container className="d-sm-none" 
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
