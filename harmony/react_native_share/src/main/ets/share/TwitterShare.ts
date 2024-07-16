import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import { ShareOptions, ShareSingleOptions, ShareSingleResult } from '../Types';
import { ShareBaseInstance } from './ShareBaseInstance';
export class TwitterShare extends ShareBaseInstance {

  constructor() {
    super("com.twitter.android", 'twitter://', '123', 'https://twitter.com/intent/tweet')
  }

  public async shareSingleWant(options: ShareSingleOptions, context: common.UIAbilityContext): Promise<ShareSingleResult> {
    let want: Want = {
      entities: ['entity.system.browsable'],
      uri: `https://twitter.com/intent/tweet?url=${encodeURIComponent(options.url)}&text=${options.title}`,
      action: 'ohos.want.action.viewData',
      parameters: {
        'ability.params.backToOtherMissionStack': true
      }
    }
    const res = await this.shareWant(want,context);
    return res;
  }
}