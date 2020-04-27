import { Controller, Get, Post, Body } from '@nestjs/common';
import { ResponseBody } from 'src/vo/ResponseBody';
import { NamespaceService } from './namespace.service';
import { Namespace } from 'src/entities/Namespace';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';

@Controller('namespace')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  @Post('/save')
  async save(@Body() vo:Namespace): Promise<ResponseBody> {
    await this.namespaceService.save(vo);
    return ResponseBody.ok();
  }

  /**
   * 根据namespaceId, languageId,KeyTranslateProgressStatus(all, unfinished, finished)
   * 分页返回,查询条件为keyname
   * @param namespaceViewDetail
   * namespaceId:1
   * referenceLanguageId:1
   * targetLanguageId:2
   * KeyTranslateProgressStatus:all
   * page:1
   * pageSize:8
   * condition:n
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
