import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { jwtConstants } from "./constants";
import { verify } from "jsonwebtoken";
import { UsersService } from "src/users/users.service";

@Injectable()
export class WsJwtGuard extends AuthGuard('ws-jwt') {
	constructor(private reflector: Reflector) { super() }

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		// const auth = context.switchToWs()
		// const bearerToken = context.getArgs()[0].handshake.headers.authorization.split(' ')[1];
		// const x = verify(bearerToken, jwtConstants.secret)
		// console.log("verify: ", x)
		// console.log("auth: ", bearerToken)
		// const payload = bearerToken;

		// console.log('jwt validate', payload);
		// const user = this.userService.getUserByUsername(payload.sub);
		// console.log('jwt validate user', user);

		// if (!user) throw new UnauthorizedException('Please log in to continue');

		return super.canActivate(context)
		// return {
		// 	id: payload.sub,
		// 	email: payload.email,
		// 	login: payload.login,
		// };
	}
}