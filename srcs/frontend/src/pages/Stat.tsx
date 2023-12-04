import { useState, useEffect } from 'react';
import { gameHistoryType } from '../../types/gameHistoryType';
import { AchieveType } from '../../types/Achieve';

export enum Result {
	WIN = 'WIN',
	LOSE = 'LOSE',
	DRAW = 'DRAW',
}

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
		const bgGrey = index % 2 ? 'bg-grey' : '';
		const color = x.win === Result.WIN ? 'magenta-text' : (x.win === Result.LOSE ? 'cyan-text' : 'grey-text');
		const text: string = (x.win === Result.WIN) ? ('Victory') : (x.win === Result.LOSE ? 'Defeat' : 'Draw');
		return (
			<li key={x.playerId}
				className={`stat-list-item ${bgGrey}`}>
				<div className='d-flex fw-light font-small justify-content-between'>
					<div>{dateStr(x.date)}</div>
					<div>against {x.against}</div>
				</div>
				<div className={`${color} d-flex flex-row justify-content-between`}>
					<div>{text}</div>
					<div> {x.score} </div>
				</div>

			</li>
		);
	}

	return (
		(gameHistory.length === 0) ? (
			<h3 className='p-3 grey-text pb-5'>Empty</h3>
		) : (
			<ul className="p-1 pb-5">
				{gameHistory.reverse().map(listItem)}
			</ul>
		)
	);
}

function AchieveContent({ achieve }: achieveProp) {
	const achieveList = ['firstWin', 'win10Games', 'win100Games', 'play100Games', 'play1000Games']

	const myMap = (x: string, index: number) => {
		const color = (achieve[x as keyof (typeof achieve)]) ? '' : 'grey-text';
		return (
			<li
				key={`${achieve.userId}_${x}`}
				className={`d-flex flex-wrap stat-list-item ${color}`}
			>
				{x}
			</li>
		);
	}

	return (
		<ul className="m-auto pb-5 px-1">
			{achieveList.map(myMap)}
		</ul>
	);
}

type pieProp = {
	win: number,
	lose: number,
	draw: number,
}

function PieChart({ win, lose, draw }: pieProp) {

	function gradientDoghnut(win: number, lose: number) {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D || null;
		if (!ctx) return;
		const xc = 100;
		const yc = 100;
		const r = 60;
		let total: number = win + lose;
		ctx.font = "20px normal";
		ctx.fillStyle = '#fff';
		if (total === 0) {
			ctx.beginPath();
			ctx.strokeStyle = 'grey';
			ctx.arc(xc, yc, r, 0, (2 * Math.PI), false);
			ctx.lineWidth = 10;
			ctx.stroke();
			return;
		}

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
			if (startColor === endColor) {
				gradient = startColor;
			}

			ctx.beginPath();
			ctx.strokeStyle = gradient;
			ctx.arc(xc, yc, r, start, start + deg, false);
			ctx.lineWidth = 10;
			ctx.stroke();
			start += deg;
		}
	}

	useEffect(() => {
		gradientDoghnut(win, lose);
	}, [win, lose]);

	return (
		<div className='container my-5'>
			<div className='row justify-content-center'>
				<div className='col-sm-4 d-flex flex-column justify-content-center align-items-center'>
					<canvas id="canvas" width='200' height='200' />
					<h5 className='win-rate'>
						{(win + lose === 0) ? ('NA') : (win * 100 / (win + lose)).toFixed(2) + '%'}
					</h5>
				</div>
				<div className='col-sm-4 d-flex white-text justify-content-center align-items-center'>
					<h5>
						Win: {win}<br />
						Lose: {lose} <br />
						Draw: {draw} <br />
					</h5>
				</div>
			</div>
		</div>
	);
}

export default function Stat({ gameHistory, achieve }: statProp) {
	const [show, setShow] = useState<'history' | 'achieve'>('history');

	useEffect(() => {
		let history = document.getElementById('history');
		let achieve = document.getElementById('achieve');
		if (!history || !achieve) return;
		history.classList.toggle("greyout");
		achieve.classList.toggle("greyout");

		let historyContent = document.getElementById('history-content');
		let achieveContent = document.getElementById('achieve-content');
		if (!historyContent || !achieveContent) return;
		historyContent.classList.toggle("d-none");
		achieveContent.classList.toggle("d-none");
		historyContent.classList.toggle("d-sm-flex");
		achieveContent.classList.toggle("d-sm-flex");
	}, [show]);

	return (
		<>
			<PieChart win={gameHistory.filter((x) => (x.win === Result.WIN)).length} lose={gameHistory.filter((x) => (x.win === Result.LOSE)).length}
				draw={gameHistory.filter((x) => (x.win === Result.DRAW)).length} />
			<div className='container pb-3'>
				{/* title: small screan */}
				<div className="row d-sm-none">
					<div className="col-6">
						<h5 className="tab-main-color greyout" id="history"
							onClick={(e) => (setShow('history'))}>
							History
						</h5>
					</div>
					<div className="col-6">
						<h5 className="tab-main-color" id="achieve"
							onClick={() => setShow('achieve')}>
							Achieve
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
							Achieve
						</h5>
					</div>
				</div>
				{/* content */}
				<div className="row">
					<div className="col-12 col-sm-6 d-none d-sm-flex" id='history-content' style={{ maxHeight: '300px', overflowY: 'scroll' }}>
						<HistoryContent gameHistory={gameHistory.map((a) => ({ ...a }))} />
					</div>
					<div className="col-12 col-sm-6 p-0" id='achieve-content' style={{ maxHeight: '300px', overflowY: 'scroll' }}>
						<AchieveContent achieve={{ ...achieve }} />
					</div>
				</div>
			</div >
		</>
	);
}
