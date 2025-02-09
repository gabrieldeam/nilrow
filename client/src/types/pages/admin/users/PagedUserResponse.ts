// Exemplo de interface do que o back-end retorna
export interface PagedUserResponse {
    content: UserData[];
    totalPages: number;
    // outras propriedades: pageSize, totalElements etc.
  }
  
  export interface UserData {
    id: string;
    cpf: string;
    nickname: string;
    email: string;
    // etc...
  }
  