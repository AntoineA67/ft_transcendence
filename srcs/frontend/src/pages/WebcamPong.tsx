// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {
	HandLandmarker,
	FilesetResolver,
	DrawingUtils
} from "@mediapipe/tasks-vision";
import { MutableRefObject, useEffect, useRef } from "react";

export const WebcamPong = ({ changeHandPos, webcam, onWebcamFinishedLoading }: { changeHandPos: any, webcam: boolean, onWebcamFinishedLoading: () => void }) => {
	let handLandmarker: HandLandmarker;
	let stream: MutableRefObject<MediaStream | null> = useRef<MediaStream | null>(null);
	let video: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement | null>(null);


	useEffect(() => {
		console.log("webcam pong", webcam)
		if (!webcam) {
			handLandmarker?.close();
			console.log(stream)
			stream.current?.getTracks().forEach((track: MediaStreamTrack) => {
				console.log(track);
				track.stop()
			});
			if (video.current) {
				video.current.srcObject = null;
			}
		} else {
			const createHandLandmarker = async () => {
				const vision = await FilesetResolver.forVisionTasks(
					"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
				);
				handLandmarker = await HandLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
						delegate: "GPU"
					},
					runningMode: "IMAGE"
				});
			};
			createHandLandmarker();
		}
	}, [webcam]);

	useEffect(() => {
		video.current = document.getElementById("webcam") as any
		const demosSection = document.getElementById("demos");
		let runningMode = "IMAGE";
		let enableWebcamButton: HTMLButtonElement;
		let webcamRunning: Boolean = false;
		const videoHeight = "360px";
		const videoWidth = "480px";

		// Before we can use HandLandmarker class we must wait for it to finish
		// loading. Machine Learning models can be large and take a moment to
		// get everything needed to run.
		const createHandLandmarker = async () => {
			const vision = await FilesetResolver.forVisionTasks(
				"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
			);
			handLandmarker = await HandLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
					delegate: "GPU"
				},
				runningMode: runningMode as any
			});
			demosSection?.classList.remove("invisible");
		};

		/********************************************************************
		 // Demo 2: Continuously grab image from webcam stream and detect it.
		 ********************************************************************/

		const canvasElement: any = document.getElementById("output_canvas");
		const canvasCtx = canvasElement?.getContext("2d");

		let lastVideoTime = -1;
		let results: any = undefined;

		// Check if webcam access is supported.
		function hasGetUserMedia() {
			return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
		}

		async function predictWebcam() {
			if (!handLandmarker || !canvasCtx || !video.current || !video.current.srcObject) {
				changeHandPos(-1);
			};
			canvasElement.style.width = video.current?.videoWidth;;
			canvasElement.style.height = video.current?.videoHeight;
			canvasElement.width = video.current?.videoWidth;
			canvasElement.height = video.current?.videoHeight;
			const drawingUtils = new DrawingUtils(canvasCtx);

			// Now let's start detecting the stream.
			if (runningMode === "IMAGE") {
				runningMode = "VIDEO";
				await handLandmarker.setOptions({ runningMode: "VIDEO" });
			}
			let startTimeMs = performance.now();
			if (lastVideoTime !== video.current?.currentTime && video.current) {
				lastVideoTime = video.current?.currentTime;
				results = handLandmarker.detectForVideo(video.current, startTimeMs);
			}
			canvasCtx.save();
			canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
			if (results.landmarks) {
				for (const landmarks of results.landmarks) {
					drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
						color: "#00FF00",
						lineWidth: 5
					});
					drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
					// console.log(landmarks)
				}
				if (results.landmarks.length > 0) {
					const pos = results.landmarks[0][9].y;
					changeHandPos(pos);
					// console.log(pos);
				}
			} else {
				changeHandPos(-1);
			}
			canvasCtx.restore();

			// Call this function again to keep predicting when the browser is ready.
			if (webcamRunning === true) {
				window.requestAnimationFrame(predictWebcam);
			}
		}

		// Enable the live webcam view and start detection.
		function enableCam(event: any) {
			if (!handLandmarker) {
				alert("Please wait for handLandmarker to load");
				return;
			}

			if (webcamRunning === true) {
				webcamRunning = false;
				enableWebcamButton.innerText = "ENABLE PREDICTIONS";
				changeHandPos(-1);
				if (stream.current) {
					stream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
				}
			} else {
				webcamRunning = true;
				enableWebcamButton.innerText = "DISABLE PREDICTIONS";
			}

			// getUsermedia parameters.
			const constraints = {
				video: true,
			};

			// Activate the webcam stream.
			navigator.mediaDevices.getUserMedia(constraints).then(function (s) {
				if (video.current) {
					video.current.srcObject = s;
					stream.current = s;
					console.log(s, stream);
					video.current.addEventListener("loadeddata", predictWebcam);
				}
			});
		}

		video.current?.addEventListener("loadeddata", onWebcamFinishedLoading);

		createHandLandmarker();
		// If webcam supported, add event listener to button for when user
		// wants to activate it.
		if (hasGetUserMedia()) {
			enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
			enableWebcamButton?.addEventListener("click", enableCam);
		} else {
			console.log("getUserMedia() is not supported by your browser");
		}
		return () => {
			handLandmarker?.close();
			video.current?.removeEventListener("loadeddata", onWebcamFinishedLoading);
			video.current?.addEventListener("loadeddata", predictWebcam);
		}
	}, []);



	return (
		<>
			<section style={{ position: "fixed" }} id="demos" className="invisible">
				<div id="liveView" className="videoView">
					<button id="webcamButton" className="mdc-button mdc-button--raised">
						<span className="mdc-button__ripple"></span>
						<span className="mdc-button__label">ENABLE WEBCAM</span>
					</button>
					<div style={{ position: "fixed", opacity: .2 }}>
						<video id="webcam" autoPlay playsInline></video>
						<canvas className="output_canvas" id="output_canvas" width="1280" height="720" style={{ position: "absolute", left: "0px", top: "0px" }}></canvas>
						{/* <p id='gesture_output' className="output" /> */}
					</div>
				</div>
			</section >

		</>
	);
};
