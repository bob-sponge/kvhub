import { Controller, Post, Body } from '@nestjs/common';
import { NamespaceService } from './namespace.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';
import { NamespaceKey } from 'src/vo/NamespaceKey';

@Controller('namespace')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}
  /**
   * 根据namespaceId, languageId,KeyTranslateProgressStatus(all, unfinished, finished)
   * 分页返回,查询条件为keyname
   * @param namespaceViewDetail:
   * @returns
   * {
    "statusCode": 0,
    "data": [
        {
            "keyId": 1,
            "keyName": "t1",
            "refreLanguageValue": {
                "valueId": 1,
                "keyValue": "aaaa",
                "languageId": 1
            },
            "targetLanguageValue": {
                "valueId": 6,
                "keyValue": "wewee",
                "languageId": 2
            }
        }
      ],
    "message": "success"
    }
   */
  @Post('/view/keys')
  async view(@Body() namespaceViewDetail: NamespaceViewDetail): Promise<ResponseBody> {
    const namespaceKey: any[] = await this.namespaceService.getKeysByCondition(namespaceViewDetail);
    return ResponseBody.okWithData(namespaceKey);
  }
}
