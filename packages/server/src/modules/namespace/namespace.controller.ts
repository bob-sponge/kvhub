import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { NamespaceService } from './namespace.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { Namespace } from 'src/entities/Namespace';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';
import * as Log4js from 'log4js';

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
    // todo namespaceViewDetail中应该增加param branchid
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

  /**
   * @description
   *  增加或者编辑 key value
   *  如果是增加，keyId 传 "", 编辑的话，传入对应的 key id.
   *  对于编辑来说，每次传入所有有值的语言的value,尽管此语言的value 可能和上一个值一致。
   *  对于新增来说，传入有值的语言的 value,这样可以减少存储。
   * @request
   *  url: http://localhost:5000/namespace/view/keyvalue
   *  method: post
   *  body:
   *    example:
   *
        {
          "branchId": 1,
          "namespaceId": 1,
          "keyId": 1233,
          "keyName": "hao",
          "kv": [{
            "languageId":1,
            "value": "hao"
          },{
            "languageId":2,
            "value": "好"
          }]
        }
      @returns
       sucess:
         {
            "statusCode": 0,
            "data": true,
            "message": "success"
         }
       fail:
         {
            "statusCode": -1,
            "data": false,
            "message": "Key name already exist on branch dev ."
         }
   */
  @Post('/view/keyvalue')
  async addKeyValue(@Body() keyvalue: any) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const branchId = keyvalue.branchId;
    const namespaceId = keyvalue.namespaceId;
    const keyId = keyvalue.keyId;
    const keyName = keyvalue.keyName;
    const data: [] = keyvalue.kv;
    logger.info(`view keyvalue: key id: ${keyId}, key name: ${keyName}`);
    // 如果key id 有值，则为修改，否则为增加
    let msg = '';
    try {
      await this.namespaceService.editKeyValue(branchId, namespaceId, keyId, keyName, data);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    return ResponseBody.okWithMsg('success');
  }

  /**
   * @description
   * 修改 key 的name
   * @request
   *  url: http://localhost:5000/namespace/view/keyname
   *  method: post
   *  body:
   *    example:
   *
        {
          "keyId": 1233,
          "keyName": "hao"
        }
   * @returns
      success
      {
          "statusCode": 0,
          "data": true,
          "message": "success"
      }
   */
  @Post('/view/keyname')
  async editKeyname(@Body() data: any) {
    const keyId = data.keyId;
    const keyName = data.keyName;
    let msg = '';
    try {
      await this.namespaceService.editKeyname(keyId, keyName);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    return ResponseBody.okWithMsg('success');
  }

  /**
   * @description
   * 删除 key
   * @request
   *  url: http://localhost:5000/namespace/view/key/26
   *  method: Delete
   * @returns
      success
      {
          "statusCode": 0,
          "data": true,
          "message": "success"
      }
   */
  @Delete('/view/key/:keyId')
  async deleteKey(@Param('keyId') keyId: number) {
    let msg = '';
    try {
      // todo before delete key record,will verify the relationship between Branch and key
      await this.namespaceService.deleteKey(keyId);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    return ResponseBody.okWithMsg('success');
  }

  /**
   * @description
   * 删除 namespace
   * @request
   *  url: http://localhost:5000/namespace/view/26
   *  method: Delete
   * @returns
      success
      {
          "statusCode": 0,
          "data": true,
          "message": "success"
      }
   */
  @Delete('/view/:namespaceId')
  async deleteNamespace(@Param('namespaceId') namespaceId: number) {
    let msg = '';
    try {
      await this.namespaceService.deleteNamespace(namespaceId);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    return ResponseBody.okWithMsg('success');
  }
}
