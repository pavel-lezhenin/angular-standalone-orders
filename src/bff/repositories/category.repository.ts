import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Category } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class CategoryRepository extends BaseRepository<Category> {
  storeName = 'categories';

  constructor(db: DatabaseService) {
    super(db);
  }
}
