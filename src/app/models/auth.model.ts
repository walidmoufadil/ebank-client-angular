export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    'access-token': string;
    type?: string;
}

export interface User {
    id?: number;
    username: string;
    roles?: string[];
}
