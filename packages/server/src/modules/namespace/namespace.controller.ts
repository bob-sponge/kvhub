import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NamespaceService } from './namespace.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { Namespace } from 'src/entities/Namespace';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';

@Controller('namespace')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  @Post('/save')
  async save(@Body() vo: Namespace): Promise<ResponseBody> {
    await this.namespaceService.save(vo);
    return ResponseBody.ok();
  }

  /**
   * @description
   * 根据namespaceId, languageId,KeyTranslateProgressStatus(all, unfinished, finished)查询key
   * 分页返回,搜索查询条件为keyname
   * @request
   * url: http://localhost:5000/namespace/view/keys
   * method: post
   * body:
   * {
      "namespaceId":1,
      "referenceLanguageId":1,
      "targetLanguageId":2,
      "KeyTranslateProgressStatus":"all", # all, unfinished, finished
      "page":1, #起始页，第一页为 1
      "pageSize":10, #分页大小
      "condition":"" #搜索条件 ，如果么有，传"",表示查询所有
      }
   * @returns
   * {
    "statusCode": 0,
    "data": {
        "keys": [
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
            },
            {
                "keyId": 2,
                "keyName": "t2",
                "refreLanguageValue": {
                    "valueId": 2,
                    "keyValue": "ass",
                    "languageId": 1
                },
                "targetLanguageValue": {
                    "valueId": null,
                    "keyValue": null,
                    "languageId": 2
                }
            }
        ],
        "totalNum": 7
    },
    "message": "success"
}
   */
  @Post('/view/keys')
  async view(@Body() namespaceViewDetail: NamespaceViewDetail): Promise<ResponseBody> {
    const namespaceKey = await this.namespaceService.getKeysByCondition(namespaceViewDetail);
    return ResponseBody.okWithData(namespaceKey);
  }
  /**
   * @description 获取命名空间所有语言
   * @request id namespace id
   * url: http://localhost:5000/namespace/view/1/languages
   * method: get
   * param:
   *   id # namespace id,这是一个 路径变量，在url的 view 之后
   * @returns
   * {
    "statusCode": 0,
    "data": [
        {
            "id": 1,
            "name": "english"
        },
        {
            "id": 2,
            "name": "chinese"
        }
    ],
    "message": "success"
    }
   */
  @Get('/view/:id/languages')
  async language(@Param('id') id: number): Promise<ResponseBody> {
    const language = await this.namespaceService.getNamespaceLanguage(id);
    return ResponseBody.okWithData(language);
  }

  /**
   * @description
   * 修改 key 的 value
   * @request
   *  url: http://localhost:5000/namespace/view/language/1/key/3
   *  method: post
   *  param: languageId # language id
   *  param: keyId # key id
   *  body: keyvalue # key value
   *  request body example:
   *  {
	      "keyvalue": "ssdsdsd11"
      }
   * @returns
    {
      "statusCode": 0,
      "data": [
          {
              "id": 17  //record id
          }
      ],
      "message": "success"
    }
   */
  @Post('/view/language/:languageId/key/:keyId')
  async editKeyValue(
    @Param('languageId') languageId: number,
    @Param('keyId') keyId: number,
    @Body() keyvalue: any,
  ): Promise<ResponseBody> {
    const value = keyvalue.keyvalue;
    const data = await (await this.namespaceService.editKeyValueOnlanguage(languageId, keyId, value)).raw;
    return ResponseBody.okWithData(data);
  }
}
