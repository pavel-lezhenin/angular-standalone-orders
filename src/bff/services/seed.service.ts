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
  constructor(
    private userRepo: UserRepository,
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository,
  ) {}

  async seedAll(): Promise<void> {
    console.log('🌱 Starting database seed...');
    try {
      // Clear existing data for fresh seed
      await this.clearAll();
      
      await this.seedUsers();
      const categories = await this.seedCategories();
      await this.seedProducts(categories);

      // Verify data was created
      const userCount = await this.userRepo.count();
      const categoryCount = await this.categoryRepo.count();
      const productCount = await this.productRepo.count();
      
      console.log('✅ Database seeded with demo data');
      console.log(`   Users: ${userCount}, Categories: ${categoryCount}, Products: ${productCount}`);
      
      // Verify admin user exists
      const adminUser = await this.userRepo.getByEmail('admin@demo');
      console.log(`   Admin user check: ${adminUser ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    } catch (error) {
      console.error('❌ Seed failed:', error);
      throw error;
    }
  }

  private async clearAll(): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    try {
      // Clear all repositories
      const allProducts = await this.productRepo.getAll();
      for (const product of allProducts) {
        await this.productRepo.delete(product.id);
      }

      const allCategories = await this.categoryRepo.getAll();
      for (const category of allCategories) {
        await this.categoryRepo.delete(category.id);
      }

      const allUsers = await this.userRepo.getAll();
      for (const user of allUsers) {
        await this.userRepo.delete(user.id);
      }
      
      console.log('✅ Data cleared');
    } catch (error) {
      console.error('⚠️  Clear data warning:', error);
      // Continue even if clear fails (might be first run)
    }
  }

  private async seedUsers(): Promise<void> {
    console.log('👥 Creating demo users...');
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
        updatedAt: now,
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
        updatedAt: now,
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
        updatedAt: now,
      },
    ];

    for (const user of users) {
      try {
        await this.userRepo.create(user);
        console.log(`  ✓ Created user: ${user.email}`);
      } catch (error) {
        console.error(`  ✗ Failed to create user ${user.email}:`, error);
        throw error;
      }
    }
    console.log('✅ Demo users created (3)');
  }

  private async seedCategories(): Promise<Category[]> {
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
    return categories;
  }

  private async seedProducts(categories: Category[]): Promise<void> {
    const now = Date.now();

    if (!categories || categories.length === 0) {
      throw new Error('Categories must be seeded before products');
    }

    // Product templates by category
    const productTemplates = {
      // Electronics (12 products)
      electronics: [
        { name: 'Wireless Headphones', desc: 'High-quality wireless Bluetooth headphones', price: 79.99, stock: 45 },
        { name: 'USB-C Cable', desc: 'Durable USB-C charging and data cable', price: 12.99, stock: 150 },
        { name: 'Smartphone Stand', desc: 'Adjustable aluminum smartphone stand', price: 24.99, stock: 67 },
        { name: 'Wireless Mouse', desc: 'Ergonomic wireless mouse with rechargeable battery', price: 34.99, stock: 89 },
        { name: 'Mechanical Keyboard', desc: 'RGB mechanical gaming keyboard', price: 129.99, stock: 23 },
        { name: 'Webcam HD', desc: '1080p HD webcam with auto-focus', price: 59.99, stock: 34 },
        { name: 'External SSD 1TB', desc: 'Portable external SSD with USB 3.1', price: 119.99, stock: 45 },
        { name: 'Power Bank 20000mAh', desc: 'High-capacity portable power bank', price: 39.99, stock: 78 },
        { name: 'Smart Watch', desc: 'Fitness tracker with heart rate monitor', price: 199.99, stock: 12 },
        { name: 'Bluetooth Speaker', desc: 'Waterproof portable Bluetooth speaker', price: 49.99, stock: 56 },
        { name: 'Laptop Sleeve 15"', desc: 'Protective laptop sleeve with padding', price: 29.99, stock: 91 },
        { name: 'Monitor 24" Full HD', desc: '24-inch Full HD IPS monitor', price: 159.99, stock: 18 },
      ],
      // Clothing (10 products)
      clothing: [
        { name: 'Cotton T-Shirt', desc: 'Comfortable 100% cotton t-shirt', price: 24.99, stock: 8 },
        { name: 'Blue Jeans', desc: 'Classic blue denim jeans', price: 59.99, stock: 0 },
        { name: 'Hoodie', desc: 'Warm fleece hoodie with pockets', price: 49.99, stock: 34 },
        { name: 'Running Shoes', desc: 'Lightweight running shoes with cushioning', price: 89.99, stock: 27 },
        { name: 'Winter Jacket', desc: 'Waterproof winter jacket with hood', price: 129.99, stock: 15 },
        { name: 'Wool Scarf', desc: 'Soft wool scarf in multiple colors', price: 19.99, stock: 62 },
        { name: 'Baseball Cap', desc: 'Adjustable baseball cap with embroidery', price: 14.99, stock: 103 },
        { name: 'Dress Shirt', desc: 'Formal dress shirt, wrinkle-free fabric', price: 39.99, stock: 41 },
        { name: 'Yoga Pants', desc: 'Stretchy yoga pants with pocket', price: 34.99, stock: 55 },
        { name: 'Leather Belt', desc: 'Genuine leather belt with metal buckle', price: 29.99, stock: 73 },
      ],
      // Books (8 products)
      books: [
        { name: 'Clean Code', desc: 'A Handbook of Agile Software Craftsmanship', price: 39.99, stock: 23 },
        { name: 'Design Patterns', desc: 'Elements of Reusable Object-Oriented Software', price: 44.99, stock: 5 },
        { name: 'The Pragmatic Programmer', desc: 'Your Journey To Mastery', price: 42.99, stock: 31 },
        { name: 'Refactoring', desc: 'Improving the Design of Existing Code', price: 47.99, stock: 18 },
        { name: 'Head First Design Patterns', desc: 'A Brain-Friendly Guide', price: 38.99, stock: 44 },
        { name: 'Introduction to Algorithms', desc: 'Comprehensive algorithms textbook', price: 89.99, stock: 9 },
        { name: 'You Don\'t Know JS', desc: 'Deep dive into JavaScript', price: 29.99, stock: 67 },
        { name: 'The Art of Computer Programming', desc: 'Donald Knuth classic series', price: 199.99, stock: 4 },
      ],
      // Home & Garden (10 products)
      homeGarden: [
        { name: 'LED Floor Lamp', desc: 'Modern LED floor lamp with dimmer', price: 89.99, stock: 12 },
        { name: 'Plant Pot', desc: 'Ceramic plant pot with drainage', price: 29.99, stock: 67 },
        { name: 'Garden Tools Set', desc: '5-piece stainless steel garden tools', price: 39.99, stock: 28 },
        { name: 'Throw Pillow', desc: 'Decorative throw pillow with removable cover', price: 19.99, stock: 88 },
        { name: 'Wall Clock', desc: 'Modern minimalist wall clock', price: 34.99, stock: 45 },
        { name: 'Picture Frame Set', desc: 'Set of 3 wooden picture frames', price: 24.99, stock: 52 },
        { name: 'Scented Candles', desc: 'Set of 4 aromatic scented candles', price: 29.99, stock: 71 },
        { name: 'Bath Towel Set', desc: 'Luxury cotton bath towel set of 4', price: 49.99, stock: 33 },
        { name: 'Watering Can', desc: '2-gallon galvanized watering can', price: 22.99, stock: 59 },
        { name: 'Area Rug', desc: '5x7 ft modern geometric area rug', price: 89.99, stock: 14 },
      ],
    };

    // Generate products from templates
    const products: Product[] = [];
    
    // Electronics
    productTemplates.electronics.forEach(template => {
      products.push(this.createProduct(template, categories[0]!.id, '/products/electronics.svg', now));
    });
    
    // Clothing
    productTemplates.clothing.forEach(template => {
      products.push(this.createProduct(template, categories[1]!.id, '/products/clothing.svg', now));
    });
    
    // Books
    productTemplates.books.forEach(template => {
      products.push(this.createProduct(template, categories[2]!.id, '/products/books.svg', now));
    });
    
    // Home & Garden
    productTemplates.homeGarden.forEach(template => {
      products.push(this.createProduct(template, categories[3]!.id, '/products/home-garden.svg', now));
    });

    for (const product of products) {
      await this.productRepo.create(product);
    }
    console.log(`✅ Demo products created (${products.length})`);
  }

  /**
   * Helper to create product from template
   */
  private createProduct(
    template: { name: string; desc: string; price: number; stock: number },
    categoryId: string,
    imageUrl: string,
    createdAt: number
  ): Product {
    return {
      id: uuidv4(),
      name: template.name,
      description: template.desc,
      price: template.price,
      stock: template.stock,
      categoryId,
      imageIds: [], // Empty for seed data - will be populated via UI
      specifications: [], // Empty for seed data - will be populated via UI
      imageUrl, // Legacy field for backward compatibility
      createdAt,
      updatedAt: createdAt,
    };
  }
}
