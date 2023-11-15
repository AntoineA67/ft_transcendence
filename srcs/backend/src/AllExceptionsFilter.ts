import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  
	private logger = new Logger('AllExceptionsFilter')
	
	catch(exception: unknown, host: ArgumentsHost) {		
		super.catch(exception, host);
		this.logger.log('exception: ', exception)
		this.logger.log('host: ', host)
	}
}