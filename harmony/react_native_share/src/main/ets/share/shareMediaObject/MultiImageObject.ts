/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import MediaObject from './MediaObject';

export class MultiImageObject extends MediaObject {
  uriStrs: string[] | null = null;

  getImageUris(): string[] | null {
    return this.uriStrs;
  }
}