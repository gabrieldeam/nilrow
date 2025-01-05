export interface LoginData {
    login: string;
    password: string;
    location?: string;
    device?: string;
  }
  
  export interface ResetPasswordData {
    token: string;
    newPassword: string;
  }
  