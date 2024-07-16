
import { ShareBaseInstance } from './ShareBaseInstance';
export class SnapChatShare extends ShareBaseInstance {

  constructor() {
    super("com.snapchat.android", 'snapchat://', '123')
  }
}