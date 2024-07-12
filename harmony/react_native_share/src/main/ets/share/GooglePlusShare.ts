import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
export class GooglePlusShare extends ShareBaseInstance {

  constructor() {
    super("com.google.android.apps.plus", '', '123', 'https://plus.google.com/share')
  }
  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let want: Want = {
      entities: ['entity.system.browsable'],
      uri: `https://plus.google.com/share?url=${encodeURIComponent(options.url)}`,
      action: 'ohos.want.action.viewData',
      parameters: {
        'ability.params.backToOtherMissionStack': true
      }
    }
    const res = await this.shareWant(want,context);
    return res;
  }
}