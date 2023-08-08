import { Injectable } from '@nestjs/common';

@Injectable()
export class UserFriendshipLinkService {
  private userFriendshipLinks: any[] = [];

  create(data: any) {
    this.userFriendshipLinks.push(data);
    return data;
  }

  findAll() {
    return this.userFriendshipLinks;
  }
}
