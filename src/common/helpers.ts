import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HelperService {
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async comparePassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }
}
