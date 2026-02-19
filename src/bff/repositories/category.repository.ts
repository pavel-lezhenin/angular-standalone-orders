import { Injectable } from '@angular/core';
import type { Category } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class CategoryRepository extends BaseRepository<Category> {
  storeName = 'categories';
}
