import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class UndefinedToNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // 전에 실행되는 부분
    return next.handle().pipe(
      // 후에 실행되는 부분
      map((data) => (data === undefined ? null : { data, code: 'SUCCESS' })),
    );
  }
}
