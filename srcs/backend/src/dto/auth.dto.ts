export class CallBackDto {
    user: {
      id: number;
      email: string;
      activated2FA: boolean;
      firstConnexion: string;
    };
    query: {
      _2fa: string;
    };
  }

  