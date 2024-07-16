
import { ShareBaseInstance } from './ShareBaseInstance';


export class WhatsAppShare extends ShareBaseInstance {
  constructor() {
    super("com.whatsapp", 'whatsapp://app', '123')
  }
}