import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { User, Product, Category } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SeedService {
  private seeded = false;

  constructor(
    private userRepo: UserRepository,
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository,
  ) {}

  async seedAll(): Promise<void> {
    if (this.seeded) return;

    await this.seedUsers();
    await this.seedCategories();
    await this.seedProducts();

    this.seeded = true;
    console.log('✅ Database seeded with demo data');
  }

  private async seedUsers(): Promise<void> {
    const now = Date.now();
    const users: User[] = [
      {
        id: uuidv4(),
        email: 'user@demo',
        password: 'User123!',
        role: 'user',
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          phone: '+1 (555) 123-4567',
        },
        createdAt: now,
      },
      {
        id: uuidv4(),
        email: 'manager@demo',
        password: 'Manager123!',
        role: 'manager',
        profile: {
          firstName: 'Demo',
          lastName: 'Manager',
          phone: '+1 (555) 234-5678',
        },
        createdAt: now,
      },
      {
        id: uuidv4(),
        email: 'admin@demo',
        password: 'Admin123!',
        role: 'admin',
        profile: {
          firstName: 'Demo',
          lastName: 'Admin',
          phone: '+1 (555) 345-6789',
        },
        createdAt: now,
      },
    ];

    for (const user of users) {
      await this.userRepo.create(user);
    }
    console.log('✅ Demo users created (3)');
  }

  private async seedCategories(): Promise<void> {
    const categories: Category[] = [
      {
        id: uuidv4(),
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      },
      {
        id: uuidv4(),
        name: 'Clothing',
        description: 'Apparel and fashion items',
      },
      {
        id: uuidv4(),
        name: 'Books',
        description: 'Books and reading materials',
      },
      {
        id: uuidv4(),
        name: 'Home & Garden',
        description: 'Home and garden products',
      },
    ];

    for (const category of categories) {
      await this.categoryRepo.create(category);
    }
    console.log('✅ Demo categories created (4)');
  }

  private async seedProducts(): Promise<void> {
    const now = Date.now();
    const categories = await this.categoryRepo.getAll();

    if (!categories || categories.length === 0) {
      throw new Error('Categories must be seeded before products');
    }

    const products: Product[] = [
      // Electronics
      {
        id: uuidv4(),
        name: 'Wireless Headphones',
        description: 'High-quality wireless Bluetooth headphones',
        price: 79.99,
        categoryId: categories[0]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EHeadphones%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      {
        id: uuidv4(),
        name: 'USB-C Cable',
        description: 'Durable USB-C charging and data cable',
        price: 12.99,
        categoryId: categories[0]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EUSB Cable%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      // Clothing
      {
        id: uuidv4(),
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt',
        price: 24.99,
        categoryId: categories[1]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3ET-Shirt%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      {
        id: uuidv4(),
        name: 'Blue Jeans',
        description: 'Classic blue denim jeans',
        price: 59.99,
        categoryId: categories[1]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EJeans%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      // Books
      {
        id: uuidv4(),
        name: 'Clean Code',
        description: 'A Handbook of Agile Software Craftsmanship',
        price: 39.99,
        categoryId: categories[2]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EClean Code%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      {
        id: uuidv4(),
        name: 'Design Patterns',
        description: 'Elements of Reusable Object-Oriented Software',
        price: 44.99,
        categoryId: categories[2]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EDesign Patterns%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      // Home & Garden
      {
        id: uuidv4(),
        name: 'LED Floor Lamp',
        description: 'Modern LED floor lamp with dimmer',
        price: 89.99,
        categoryId: categories[3]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3ELamp%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
      {
        id: uuidv4(),
        name: 'Plant Pot',
        description: 'Ceramic plant pot with drainage',
        price: 29.99,
        categoryId: categories[3]!.id,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EPot%3C/text%3E%3C/svg%3E',
        createdAt: now,
      },
    ];

    for (const product of products) {
      await this.productRepo.create(product);
    }
    console.log('✅ Demo products created (7)');
  }
}
