import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Architecture ready: Process Bearer token if present
    // For MVP: Token is accepted but not validated
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Future: Validate token and attach user context
      // For MVP: Token is accepted but not validated
      // req.user = await this.validateToken(token);
    }
    
    next();
  }
}
