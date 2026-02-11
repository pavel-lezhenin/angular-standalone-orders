import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { User } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class UserRepository extends BaseRepository<User> {
  storeName = 'users';

  constructor(db: DatabaseService) {
    super(db);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.getOneByIndex('email', email);
  }
}
