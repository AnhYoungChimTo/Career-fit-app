import { RegisterRequest, LoginRequest, PasswordResetRequest, UserDTO } from '../types';
/**
 * Register a new user
 */
export declare function registerUser(data: RegisterRequest): Promise<{
    user: UserDTO;
    token: string;
}>;
/**
 * Login user
 */
export declare function loginUser(data: LoginRequest): Promise<{
    user: UserDTO;
    token: string;
}>;
/**
 * Reset password using security question
 */
export declare function resetPassword(data: PasswordResetRequest): Promise<{
    message: string;
}>;
/**
 * Get user by ID
 */
export declare function getUserById(userId: string): Promise<UserDTO | null>;
//# sourceMappingURL=auth.service.d.ts.map