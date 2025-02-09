export interface LoginData {
    login: string;
    password: string;
    location?: string;
    device?: string;
  }
  
  export interface ResetPasswordData {
    email?: string;
    token: string;
    newPassword: string;
  }
  