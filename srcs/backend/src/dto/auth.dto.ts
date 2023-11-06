export class CallBackDto {
    user: {
      id: number;
      email: string;
      activated2FA: boolean;
      firstConnexion: boolean;
    };
    query: {
      _2fa: string;
    };
  }