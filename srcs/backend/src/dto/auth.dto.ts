export class CallBackDto {
    user: {
      id: number;
      email: string;
      activated2FA: boolean;
    };
    query: {
      _2fa: string;
    };
  }