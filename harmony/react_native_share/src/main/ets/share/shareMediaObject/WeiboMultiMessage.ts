/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { MultiImageObject } from './MultiImageObject';
import { TextObject } from './TextObject'
import { VideoSourceObject } from './VideoSourceObject';


export class WeiboMultiMessage {
  textObject: TextObject | null = null;
  multiImageObject: MultiImageObject | null = null;
  videoSourceObject: VideoSourceObject | null = null;
}
