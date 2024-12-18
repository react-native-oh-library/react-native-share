/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

export default class MediaObject {

  public static readonly COMMAND_TEXT = 1;
  public static readonly COMMAND_IMAGE = 2;
  public static readonly COMMAND_MUSIC = 3;
  public static readonly COMMAND_VIDEO = 4;
  public static readonly COMMAND_WEBPAGE = 5;
  public static readonly COMMAND_VOICE = 6;
  public static readonly COMMAND_CMD = 7;

  /**
   * 点击跳转 URL。注意：长度不得超过 512Bytes
   */
  actionUrl: string = '';

  /**
   * 呼起第三方特定页面
   */
  schema: string = '';

  /**
   * 唯一标识一个媒体分享，不能重复。注意：长度不得超过 512Bytes
   */
  identify: string = '';
  /**
   * 标题。注意：长度不得超过 512Bytes
   */
  title: string = '';

  /**
   * 描述。注意：长度不得超过 1kb
   */
  description: string = '';

  /**
   * 缩略图。注意：大小不得超过 32kb byte[] thumbData
   */


  constructor() {
  }

}