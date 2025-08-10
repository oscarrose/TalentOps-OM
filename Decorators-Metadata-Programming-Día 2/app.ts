import { UserService } from './user.service';

// Uso del service
async function demonstrateDecorators() {
  const userService = new UserService();

  try {
    // Test validation
    await userService.createUser({
      email: 'john@example.com',
      name: 'John Doe',
    });

    // Test caching y retry
    const user = await userService.findByEmail('john@example.com');
    console.log('Found user:', user);

    // Second call should hit cache
    const cachedUser = await userService.findByEmail('john@example.com');
    console.log('Cached user:', cachedUser);

    // Test transaction
    const newUser = await userService.createUserWithTransaction({
      email: 'jane@example.com',
      name: 'Jane Doe',
    });
    console.log('Created user with transaction:', newUser);

    
  } catch (error) {
    console.error('Error:', error);
  }
}

demonstrateDecorators();
