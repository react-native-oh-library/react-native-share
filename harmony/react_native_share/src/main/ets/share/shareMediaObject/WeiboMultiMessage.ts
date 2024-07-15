import { MultiImageObject } from './MultiImageObject';
import { TextObject } from './TextObject'
import { VideoSourceObject } from './VideoSourceObject';


export class WeiboMultiMessage {
  textObject: TextObject | null = null;
  multiImageObject: MultiImageObject | null = null;
  videoSourceObject: VideoSourceObject | null = null;
}
