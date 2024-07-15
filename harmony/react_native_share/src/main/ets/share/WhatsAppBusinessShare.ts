
import { ShareBaseInstance } from './ShareBaseInstance';


export class WhatsAppBusinessShare extends ShareBaseInstance {

  constructor() {
    super("com.whatsapp.w4b", 'whatsapp://app', '123')
  }
}