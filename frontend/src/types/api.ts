// 型定義
export type AuthVerifyRequest = {
    idToken: string;
  };
  
  export type AuthVerifyResponse = {
    id: string;
    email?: string;
    name?: string | null;
    // 必要なら roles など
  };
  
  export type UserProfile = {
    id: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
    createdAt?: string;
    // 追加フィールド（pets など）
  };

  export type LoginResponse = AuthVerifyResponse;