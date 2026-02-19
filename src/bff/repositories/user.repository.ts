import { Injectable } from '@angular/core';
import type { User } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class UserRepository extends BaseRepository<User> {
  storeName = 'users';

  async getByEmail(email: string): Promise<User | null> {
    return this.getOneByIndex('email', email);
  }
}
