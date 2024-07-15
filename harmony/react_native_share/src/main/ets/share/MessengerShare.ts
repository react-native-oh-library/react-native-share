
import { ShareBaseInstance } from './ShareBaseInstance';

export class MessengerShare extends ShareBaseInstance {

  constructor() {
    super("com.facebook.orca", 'fb-messenger://', '123')
  }

}