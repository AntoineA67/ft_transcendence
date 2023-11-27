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
	DrawingUtils,
} from "@mediapipe/tasks-vision";
import { enqueueSnackbar } from "notistack";
import { useEffect, useRef } from "react";


export const WebcamPong = ({ changeHandPos, webcam, onWebcamFinishedLoading, onError }: { changeHandPos: any, webcam: boolean, onWebcamFinishedLoading: () => void, onError: () => void }) => {
	const stream = useRef<MediaStream | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const demosRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const vision = useRef<FilesetResolver | null>(null);
	const handLandmarker = useRef<HandLandmarker | null>(null);

	let runningMode = "IMAGE";
	let webcamRunning: Boolean = false;

	let lastVideoTime = -1;
	let results: any = undefined;


	const predictWebcam = async () => {
		const canvasCtx = canvasRef.current?.getContext("2d");
		if (!webcam || !canvasRef.current || !handLandmarker || !canvasCtx || !videoRef.current || !videoRef.current.srcObject) {
			changeHandPos(-1);
			return;
		};
		canvasRef.current.style.width = videoRef.current?.videoWidth.toString();
		canvasRef.current.style.height = videoRef.current?.videoHeight.toString();
		canvasRef.current.width = videoRef.current?.videoWidth;
		canvasRef.current.height = videoRef.current?.videoHeight;
		const drawingUtils = new DrawingUtils(canvasCtx);

		// Now let's start detecting the stream.
		if (runningMode === "IMAGE") {
			runningMode = "VIDEO";
			await handLandmarker.current?.setOptions({ runningMode: "VIDEO" });
		}
		let startTimeMs = performance.now();
		if (lastVideoTime !== videoRef.current?.currentTime && videoRef.current) {
			lastVideoTime = videoRef.current?.currentTime;
			results = handLandmarker.current?.detectForVideo(videoRef.current, startTimeMs);
		}
		canvasCtx.save();
		canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		if (results.landmarks) {
			for (const landmarks of results.landmarks) {
				drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
					color: "#00FF00",
					lineWidth: 5
				});
				drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
			}
			if (results.landmarks.length > 0) {
				const pos = results.landmarks[0][9].y;
				changeHandPos(pos);
			}
		} else {
			changeHandPos(-1);
		}
		canvasCtx.restore();

		// Call this function again to keep predicting when the browser is ready.
		if (webcamRunning === true) {
			window.requestAnimationFrame(predictWebcam);
		}
		else {
			changeHandPos(-1);
		}
	}
	// Before we can use HandLandmarker class we must wait for it to finish
	// loading. Machine Learning models can be large and take a moment to
	// get everything needed to run.
	const createHandLandmarker = async () => {
		demosRef.current?.classList.remove("invisible");
		if (!vision.current || !handLandmarker.current) {

			vision.current = await FilesetResolver.forVisionTasks(
				"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
			);
			handLandmarker.current = await HandLandmarker.createFromOptions(vision.current as any, {
				baseOptions: {
					modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
					delegate: "GPU",

				},
				runningMode: runningMode as any,
			});
		}
	};
	// Enable the live webcam view and start detection.
	function enableCam() {
		if (!handLandmarker.current) {
			enqueueSnackbar("Please try again later or refresh the page", { variant: "error" });
			onError();
			return;
		}

		if (webcamRunning === true) {
			webcamRunning = false;
			changeHandPos(-1);
			if (stream.current) {
				stream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
			}
		} else {
			webcamRunning = true;
		}

		// Activate the webcam stream.
		try {
			navigator.mediaDevices.getUserMedia({ video: true }).then(function (s) {
				if (videoRef.current) {
					videoRef.current.srcObject = s;
					stream.current = s;
				}
			}).catch(function (err) {
				enqueueSnackbar("Please allow access to webcam", { variant: "error" });
				onError();
				return;
			});
		} catch (error) {
			enqueueSnackbar("Please allow access to webcam", { variant: "error" });
			onError();
			return;
		}
	}

	useEffect(() => {
		if (webcam) {
			createHandLandmarker().then(() => {
				if (webcam) {
					enableCam();
				}
			});
		} else {
			handLandmarker.current?.close();
			handLandmarker.current = null;
			stream.current?.getTracks().forEach((track: MediaStreamTrack) => {
				track.stop()
			});
			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}
			demosRef.current?.classList.add("invisible");
		}
	}, [webcam]);

	const onLoadedData = () => {
		predictWebcam();
		onWebcamFinishedLoading();
	}

	return (
		<>
			<section style={{ position: "fixed" }} ref={demosRef} className="invisible">
				<div id="liveView" className="videoView">
					<div style={{ position: "fixed", opacity: .2 }}>
						<video id="webcam" ref={videoRef} onLoadedData={onLoadedData} autoPlay playsInline></video>
						<canvas ref={canvasRef} className="output_canvas" id="output_canvas" width="1280" height="720" style={{ position: "absolute", left: "0px", top: "0px" }}></canvas>
					</div>
				</div>
			</section >

		</>
	);
};
