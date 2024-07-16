

import { ShareBaseInstance } from './ShareBaseInstance';

export class EmailShare extends ShareBaseInstance {
  constructor() {
    super("com.google.android.gm", 'gm://', '123')
  }
}