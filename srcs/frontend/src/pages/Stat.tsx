import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { useState, useEffect } from 'react';
import Winner from '../assets/winner.svg';
import { gameHistoryType } from '../../types/gameHistoryType'; 

import '../styles/Stat.css';
import { AchieveType } from '../../types/Achieve';

type statProp = {
	gameHistory: gameHistoryType[]
	achieve: AchieveType
}

type gameHistoryProp = {
	gameHistory: gameHistoryType[]
}

type achieveProp = {
	achieve: AchieveType
}

// 'more' fetch more data on click, data will be put in a useState
function HistoryContent({ gameHistory }: gameHistoryProp) {

	const dateStr = (input: any): string => {
		let date = new Date(input);
		var year = date.getFullYear();
		var month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		var day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		return month + '/' + day + '/' + year;
	}

	const listItem = (x: gameHistoryType, index: number) => {
		const classname = index % 2 ? 'history-item':'history-item-transparent';
		const color = x.win ? 'text-magenta' : 'text-cyan';
		return (
			<li key={x.playerId}
				className={`${classname} d-flex flex-wrap`}>
				<div>{dateStr(x.date)}</div>
				<div className='ms-auto me-3'> {x.against} </div>
				<div className={color}> {x.score} </div>
			</li>
		);
	}
	
	return (
		// (gameHistory.length == 0) ? ( <p style={{color: 'grey'}}>Empty</p>) : (
			<ul className="tab-ul px-sm-5 py-5">
				{gameHistory.map(listItem)}
			</ul>
		// )
	);
}



function AchieveContent({ achieve }: achieveProp) {
	const [loading, setLoading] = useState<boolean>(true);
	const [list, setList] = useState<string[]>([]);

	useEffect(() => {
		let key: keyof (typeof achieve);
		for (key in achieve) {
			achieve[key] && setList((prev) => ([... prev, key]));
		}
		setLoading(false);
	}, [])

	return (
		( loading ) ? (
			<p style={{color: 'white'}}>loading</p>
		) : (
			<ul className="tab-ul px-sm-5 py-5">			
				{list.map((str, index) => (
					<li key={index} style={{color: 'white'}}>
						{str}
					</li>
				))}
			</ul>
		)
	);
}


function PieChart({ gameHistory }: gameHistoryProp) {
	const [win] = useState(gameHistory.filter((x) => (x.win)).length)
	const [lose] = useState(gameHistory.filter((x) => (!x.win)).length)
	
	// must fix it if total is zero, rate is 0 or 100
	function gradientDoghnut(win: number, lose: number) {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D || null;
		if (!ctx) return ;
		const xc = 100;
		const yc = 100;
		const r = 60;
		let total: number = win + lose;
		const winRate: string = ((win / total) * 100).toFixed(1);
		ctx.font = "20px normal";
		ctx.fillStyle = '#fff';
		total != 0 ? ctx.fillText(winRate.toString() + '%', xc - 23, yc + 5) : (ctx.fillText('NA', xc - 23, yc +5));
		if (total == 0) return ;
		
		const magenta = '#fa34c3';
		const cyan = '#34fafa';
		const winDegree = (2 * Math.PI) * (win / total);
		const loseDegree = (2 * Math.PI) * (lose / total);
		const tran = winDegree < loseDegree ? winDegree / 2 : loseDegree / 2;
		const degree = [loseDegree - tran, tran, winDegree - tran, tran];
		const color = [cyan, cyan, magenta, magenta];
		
		let start = (2 * Math.PI) * (-1 / 4);
		
		for (let i = 0; i < 4; i++) {
			let deg = degree[i];
			let xStart = xc + Math.cos(start) * r;
			let xEnd = xc + Math.cos(start + deg) * r;
			let yStart = yc + Math.sin(start) * r;
			let yEnd = yc + Math.sin(start + deg) * r;
			
			let startColor = color[i];
			let endColor = color[(i + 1) % color.length];
			let gradient: string | CanvasGradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
			gradient.addColorStop(0, startColor);
			gradient.addColorStop(1.0, endColor);
			if (startColor == endColor) {
				gradient = startColor;
			}
			
			ctx.beginPath();
			ctx.strokeStyle = gradient;
			ctx.arc(xc, yc, r, start, start + deg, false);
			ctx.lineWidth = 10;
			ctx.stroke();
			// console.log(start, start + deg);
			start += deg;
		}
	}
	
	
	useEffect(() => {
		gradientDoghnut(win, lose);
	}, []);
	
	return (
		<Container className='my-5'>
			<div className='row justify-content-center'>
				<div className='col-sm-4 d-flex justify-content-center align-items-center'>
					<canvas id="canvas" width='200' height='200'/>
				</div>
				<div className='col-sm-4 d-flex justify-content-center align-items-center'>
					<h5 style={{color: 'white'}}> Win: {win}<br />Lose: {lose} </h5>
				</div>
			</div>
		</Container>
	);
}

export default function Stat({ gameHistory, achieve} : statProp) {
	const [show, setShow] = useState<'history' | 'achieve'>('history');
	
	useEffect(() => {
		let history = document.getElementById('history');
		let achieve = document.getElementById('achieve');
		if (!history || !achieve) return ;
		history.classList.toggle("tab-greyout");
		achieve.classList.toggle("tab-greyout");
		
		let historyContent = document.getElementById('history-content');
		let achieveContent = document.getElementById('achieve-content');
		if (!historyContent || !achieveContent) return ;
		historyContent.classList.toggle("d-none");
		achieveContent.classList.toggle("d-none");
		historyContent.classList.toggle("d-sm-flex");
		achieveContent.classList.toggle("d-sm-flex");
	}, [show]);

	return (
		<>
			<PieChart gameHistory={gameHistory} />
			<Container>
				{/* title: small screan */}
				<div className="row d-sm-none">
					<div className="col-6">
						<h5 className="tab-main-color tab-greyout" id="history"
							onClick={(e) => (setShow('history'))}>
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
				{/* title: big screen */}
				<div className=" d-none d-sm-flex row">
					<div className="col-6">
						<h5 className="tab-main-color" id="history">
							History
						</h5>
					</div>
					<div className="col-6">
						<h5 className="tab-main-color" id="achieve">
							Achieve.
						</h5>
					</div>
				</div>
				{/* content */}
				<div className="row">
					<div className="col-12 col-sm-6 d-none d-sm-flex p-0" id='history-content'>
						<HistoryContent gameHistory={gameHistory} />
					</div>
					<div className="col-12 col-sm-6 p-0" id='achieve-content'>
						<AchieveContent achieve={achieve} />	
					</div>
				</div>
			</Container>
		</>

	);
	
}
