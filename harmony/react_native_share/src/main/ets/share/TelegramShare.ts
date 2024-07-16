

import { ShareBaseInstance } from './ShareBaseInstance';

export class TeleGramShare extends ShareBaseInstance {

  constructor() {
    super("org.telegram.messenge", 'tg://', '123')
  }
}