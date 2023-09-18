import React from "react";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { socket } from "./socket";

export function Guest() {
	return (
		localStorage.getItem('token') ? (
			<Navigate to='/' replace={true} />
		) : (
			<Outlet />
		)
	)
}