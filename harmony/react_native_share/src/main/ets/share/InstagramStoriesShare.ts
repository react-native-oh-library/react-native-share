import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import wantConstant from '@ohos.app.ability.wantConstant';
import { InstagramStoriesShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
import { FileUtils } from '../utils/FileUtils';

export class InstagramStoriesShare extends ShareBaseInstance {

  constructor() {
    super("com.instagram.android", 'instagram-stories://', '123');
  }

  public async shareSingleWant(options: InstagramStoriesShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    const fileUtil = FileUtils.getInstance();
    let want: Want = {
      action: 'ohos.want.action.sendData',
      deviceId: '',
      bundleName: this.bundleName,
      flags: wantConstant.Flags.FLAG_AUTH_READ_URI_PERMISSION | wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION,
      uri: options.backgroundVideo ? options.backgroundVideo : options.backgroundImage,
      type: fileUtil.hasValidKey("backgroundVideo", options) ? 'video/*' : 'image/*',
    }
    const res = await this.shareWant(want,context);
    return res;
  }

}