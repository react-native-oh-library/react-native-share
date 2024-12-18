/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import { ShareOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';

export class LinkedinShare extends ShareBaseInstance {

  constructor() {
    super("com.linkedin.android", 'linkedin://', '123', 'https://www.linkedin.com/shareArticle')
  }

  public async shareSingleWant(options: ShareOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let want: Want = {
      entities: ['entity.system.browsable'],
      uri: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(options.url)}&title=${options.title}`,
      action: 'ohos.want.action.viewData',
      parameters: {
        'ability.params.backToOtherMissionStack': true
      }
    }
    const res = await this.shareWant(want,context);
    return res;
  }
}