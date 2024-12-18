/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import Want from '@ohos.app.ability.Want';
import wantConstant from '@ohos.app.ability.wantConstant';
import common from '@ohos.app.ability.common'
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import { FileUtils } from '../utils/FileUtils'

export class TestShare extends ShareBaseInstance {

  constructor() {
    super("com.test", 'test://', '1213')
  }

  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    const fileUtil = FileUtils.getInstance();
    let url = options.url;
    if (!url) {
      return { success: false, message: 'no url can share please define url param' }
    }
    if (fileUtil.isBase64File(url)) {
      let path = await fileUtil.writeBase64File(context, url);
      url = path;
    }
    let type = fileUtil.getMIMETypeFromExtension(url)
    let want: Want = {
      deviceId: '', // deviceId为空表示本设备
      bundleName: "com.example.mytest2",
      abilityName: 'EntryAbility',
      action: 'ohos.want.action.sendData',
      type: type,
      uri: url,
      flags: wantConstant.Flags.FLAG_AUTH_READ_URI_PERMISSION | wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION,
      parameters: {
        'ability.params.backToOtherMissionStack': true,
        'ohos.extra.param.key.shareUrl': url,
        'ohos.extra.param.key.contentTitle': options.title || '',
        'ohos.extra.param.key.shareAbstract': options.subject || '',
        'com.myTest.imageList': type?.startsWith('image') ? url : '',
        'com.myTest.videoPath': type?.startsWith('video') ? url : '',
      }
    }
    const res = await super.shareWant(want, context);
    return res;
  }

}