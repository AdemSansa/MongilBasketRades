export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'COACH' | 'PARENT';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AppUser;
}
