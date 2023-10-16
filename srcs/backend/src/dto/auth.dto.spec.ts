// Importing required dependencies:
// 1. The DTO (Data Transfer Object) definition for authentication.
// 2. The validate function from the 'class-validator' library to validate the DTO instances.
import { AuthDto } from './auth.dto';
import { validate } from 'class-validator';

// Describes a group of related tests specifically for the 'AuthDto' class.
describe('AuthDto', () => {

    // This is an individual test case to check if a valid AuthDto can be created.
    it('should create a valid AuthDto', async () => {

        // Creating an instance of the AuthDto.
        const dto = new AuthDto();

        // Assigning a valid email and password to the AuthDto instance.
        dto.email = 'test@example.com';
        dto.password = 'password123';

        // The validate function from class-validator is used to check the 
        // validity of the AuthDto instance based on the decorators in the AuthDto definition.
        // For example, it checks if the 'email' is in a valid email format.
        const errors = await validate(dto);
        
        // This assertion checks if the validation errors array is empty.
        // An empty errors array means the DTO was valid as expected.
        expect(errors).toHaveLength(0);
    });

    // This is an individual test case to check if an AuthDto with an invalid email is correctly identified.
    it('should fail for invalid email', async () => {

        // Creating another instance of the AuthDto.
        const dto = new AuthDto();

        // Assigning an invalid email format and a password to the AuthDto instance.
        dto.email = 'invalid-email';
        dto.password = 'password123';

        // Again, using the validate function to check the validity of the AuthDto instance.
        const errors = await validate(dto);
        
        // This assertion checks if the validation errors array has exactly one error.
        // As the email has an invalid email format, it should result in one error.
        expect(errors).toHaveLength(1);
        
        // This additional assertion checks if the property causing the error is 'email'.
        // This is to ensure the error is indeed due to the invalid email.
        expect(errors[0].property).toBe('email');
    });

    // Further tests can be added to this describe block to test other scenarios.
});