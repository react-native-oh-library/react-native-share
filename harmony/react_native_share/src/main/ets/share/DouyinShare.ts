import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import wantConstant from '@ohos.app.ability.wantConstant';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import { FileUtils } from '../utils/FileUtils';

export class DouyinShare extends ShareBaseInstance {

  constructor() {
    super("com.ss.hm.ugc.aweme", 'snssdk1128://openplatform/share', '123')
  }

  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    const type = options.type;
    let result = { success: false, message: '' };
    if (!type) {
      return {...result,message:'type is not define you must define it image or video'}
    }
    let isImage = true;
    if (type?.startsWith('image')) {
      isImage = true
    }
    if (type?.startsWith('video')) {
      isImage = false
    }
    const fileUtil = FileUtils.getInstance();
    let urls = new Array<string>();
    if (fileUtil.hasValidKey('url', options) && !fileUtil.hasValidKey('urls', options)) {
      urls.push(options.url);
    }
    if (fileUtil.hasValidKey('urls', options)) {
      urls = urls.concat(options.urls)
    }
    const urlsArr = urls.map(async (url) => {
      let fileUrl = url;
      if (fileUtil.isBase64File(fileUrl)) {
        fileUrl = await fileUtil.writeBase64File(context, fileUrl);
      }
      return fileUrl;
    })
    if (urlsArr.length === 0) {
      return {...result,message:'no urls can share'}
    }
    let want: Want = {
      deviceId: '', // deviceId为空表示本设备
      bundleName: 'com.ss.hm.ugc.aweme',
      moduleName: 'entry', // moduleName非必选
      abilityName: 'MainAbility',
      uri: 'snssdk1128://openplatform/share',
      flags: wantConstant.Flags.FLAG_AUTH_READ_URI_PERMISSION | wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION,
      parameters: {
        msg: options.subject,
        title: options.title,
        share_to_publish: 1,
        image_list_path: isImage ? urlsArr : null,
        video_path: isImage ? null : urlsArr[0]
      }
    }
    const res = await this.shareWant(want,context);
    return res;

  }
}