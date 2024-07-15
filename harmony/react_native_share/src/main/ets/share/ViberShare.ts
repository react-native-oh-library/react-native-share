
import { ShareBaseInstance } from './ShareBaseInstance';

export class ViberShare extends ShareBaseInstance {

  constructor() {
    super("com.viber.voip", 'viber://', '123')
  }
}