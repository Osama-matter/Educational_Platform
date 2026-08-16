export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface UserDetailsDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  createdAt?: string;
}
