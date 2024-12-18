/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { ShareBaseInstance } from './ShareBaseInstance';

export class WhatsAppShare extends ShareBaseInstance {
  constructor() {
    super("com.whatsapp", 'whatsapp://app', '123')
  }
}