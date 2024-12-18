/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';

export class PinterestShare extends ShareBaseInstance {

  constructor() {
    super("com.pinterest", 'pinterest://', '123', 'https://www.pinterest.com/pin/create/button/')
  }

  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let want: Want = {
      entities: ['entity.system.browsable'],
      uri: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(options.url)}&title=${options.title}`,
      action: 'ohos.want.action.viewData',
      parameters: {
        'ability.params.backToOtherMissionStack': true
      }
    }
    const res = await super.shareWant(want,context);
    return res;
  }
}