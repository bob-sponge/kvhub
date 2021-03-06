/* eslint-disable no-unused-expressions */
import { Controller, Post, Body, Get, Param, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { NamespaceService } from './namespace.service';
import { BranchService } from '../branch/branch.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { Namespace } from 'src/entities/Namespace';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';
import * as Log4js from 'log4js';
import { Permission } from 'src/permission/permission.decorator';
import { PermissionGuard } from 'src/permission/permission.guard';
import { PermissionCtl } from 'src/constant/constant';
import { ErrorMessage } from 'src/constant/constant';

@Controller('namespace')
@UseGuards(PermissionGuard)
export class NamespaceController {
  logger = Log4js.getLogger();
  constructor(private readonly namespaceService: NamespaceService, private readonly branchService: BranchService) {
    this.logger.level = 'info';
  }

  @Post('/save')
  async save(@Body() vo: Namespace, @Request() req): Promise<ResponseBody> {
    vo.modifier = req.cookies.token;
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
      "branchId": 分支 id
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
    // 此处需要做 merge, merge的作用是合并 master分支的kv做展示
    // 合并方案：
    // 1.如果是master分支，直接获取此分支的kv
    // 2.如果是 其他分支，需要和 master 合并， 并排序
    // 3.为了处理合并，不能在数据库分页，需代码端分页
    //
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const page = namespaceViewDetail.page;
    const pageSize = namespaceViewDetail.pageSize;
    const branchId = namespaceViewDetail.branchId;
    const branch = await this.branchService.getBranchById(branchId);

    const needFilter =
      namespaceViewDetail.condition !== null &&
      namespaceViewDetail.condition !== undefined &&
      namespaceViewDetail.condition !== '';
    if (branch === undefined) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
    }
    const offset = (page - 1) * pageSize;
    let end = offset + pageSize;
    //logger.info(`page: ${page}, page size: ${pageSize}, branchID: ${branchId}`);
    if (branch.master) {
      let namespaceKey = await this.namespaceService.getKeysByCondition(namespaceViewDetail);
      if (namespaceKey.totalNum > 0 && needFilter) {
        const filterKeys = namespaceKey.keys.filter(
          item =>
            item.keyName.search(namespaceViewDetail.condition.trim()) !== -1 ||
            (item.refreLanguageValue !== undefined && item.refreLanguageValue !== null &&
              item.refreLanguageValue.keyValue !== undefined && item.refreLanguageValue.keyValue !== null &&
              item.refreLanguageValue.keyValue.search(namespaceViewDetail.condition.trim()) !== -1) ||
              (item.targetLanguageValue !== undefined && item.targetLanguageValue !== null &&
                item.targetLanguageValue.keyValue !== undefined && item.targetLanguageValue.keyValue !== null &&
                item.targetLanguageValue.keyValue.search(namespaceViewDetail.condition.trim()) !== -1)
        );
        namespaceKey.totalNum = filterKeys.length;
        namespaceKey.keys = filterKeys;
      }
      if (namespaceKey.totalNum < end){
        end = namespaceKey.totalNum;
      }
      namespaceKey.keys = namespaceKey.keys.splice(offset,end);
      return ResponseBody.okWithData(namespaceKey);
    } else {
      // 获取 master 分支 所有的 kv
      const project = await this.namespaceService.findProject(namespaceViewDetail.namespaceId);
      const projectId = project[0].id;
      const masterBranch = await this.branchService.findMasterBranchByProjectId(projectId);
      const masterBranchId = masterBranch.id;
      const masterViewDetail = JSON.parse(JSON.stringify(namespaceViewDetail));
      masterViewDetail.branchId = masterBranchId;
      // master 分支 key
      const namespaceMasterBranchKey = await this.namespaceService.getAllKeysByCondition(masterViewDetail);
      // 查询分支k v
      const namespaceNoMasterBranchKey = await this.namespaceService.getAllKeysByCondition(namespaceViewDetail);
      const allBranchViewDetail = JSON.parse(JSON.stringify(namespaceViewDetail));
      allBranchViewDetail.KeyTranslateProgressStatus = 'all';
      // 解决 在 unfinish 条件下 非 master 分支翻译完成，master 分支翻译未完成时，非 master 分支不显示该key
      const namespaceAllNoMasterBranchKey = await this.namespaceService.getAllKeysByCondition(allBranchViewDetail);
      const namespaceAllNoMasterBranchKeyName = [];
      namespaceAllNoMasterBranchKey.forEach(item => {
        namespaceAllNoMasterBranchKeyName.push(item.keyName);
      });
      if (namespaceNoMasterBranchKey.length === 0) {
        const totalNum = namespaceMasterBranchKey.length;
        const namespaceBranchKey = namespaceMasterBranchKey.filter(
          item => namespaceAllNoMasterBranchKeyName.includes(item.keyName) === false,
        );
        namespaceBranchKey.sort((i, j) => this.sort(i, j));
        const namespaceKey = {
          keys: namespaceBranchKey,
          totalNum,
        };
        if (namespaceKey.totalNum > 0 && needFilter) {
          const filterKeys = namespaceKey.keys.filter(
            item =>
              item.keyName.search(namespaceViewDetail.condition.trim()) !== -1 ||
              (item.refreLanguageValue !== undefined && item.refreLanguageValue !== null &&
                item.refreLanguageValue.keyValue !== undefined && item.refreLanguageValue.keyValue !== null &&
                item.refreLanguageValue.keyValue.search(namespaceViewDetail.condition.trim()) !== -1) ||
                (item.targetLanguageValue !== undefined && item.targetLanguageValue !== null &&
                  item.targetLanguageValue.keyValue !== undefined && item.targetLanguageValue.keyValue !== null &&
                  item.targetLanguageValue.keyValue.search(namespaceViewDetail.condition.trim()) !== -1)
          );
          namespaceKey.totalNum = filterKeys.length;
          namespaceKey.keys = filterKeys;
        }
        if (namespaceKey.totalNum < end){
          end = namespaceKey.totalNum;
        }
        namespaceKey.keys = namespaceKey.keys.splice(offset,end);
        return ResponseBody.okWithData(namespaceKey);
      } else {
        // 合并操作
        let noMasterKeySet = new Set();
        namespaceNoMasterBranchKey.forEach(i => {
          noMasterKeySet.add(i.keyName);
        });
        const tmpBk = namespaceMasterBranchKey.filter(m => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          return noMasterKeySet.has(m.keyName) !== true;
        });
        let finalAllKv = tmpBk.concat(namespaceNoMasterBranchKey);
        finalAllKv.sort((i, j) => this.sort(i, j));
        const totalNum = finalAllKv.length;
        const namespaceKey = {
          keys: finalAllKv,
          totalNum,
        };
        if (namespaceKey.totalNum > 0 && needFilter) {
        const filterKeys = namespaceKey.keys.filter(
          item =>
            item.keyName.search(namespaceViewDetail.condition.trim()) !== -1 ||
            (item.refreLanguageValue !== undefined && item.refreLanguageValue !== null &&
              item.refreLanguageValue.keyValue !== undefined && item.refreLanguageValue.keyValue !== null &&
              item.refreLanguageValue.keyValue.search(namespaceViewDetail.condition.trim()) !== -1) ||
              (item.targetLanguageValue !== undefined && item.targetLanguageValue !== null &&
                item.targetLanguageValue.keyValue !== undefined && item.targetLanguageValue.keyValue !== null &&
                item.targetLanguageValue.keyValue.search(namespaceViewDetail.condition.trim()) !== -1)
        );
        namespaceKey.totalNum = filterKeys.length;
        namespaceKey.keys = filterKeys;
      }
      if (namespaceKey.totalNum < end){
        end = namespaceKey.totalNum;
      }
      namespaceKey.keys = namespaceKey.keys.splice(offset,end);
        return ResponseBody.okWithData(namespaceKey);
      }
    }
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
        "keyvalue": "ssdsdsd11",
        "valueId":1
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
  @Post('/view/branch/:branchId/language/:languageId/key/:keyId')
  async editKeyValue(
    @Param('branchId') branchId: number,
    @Param('languageId') languageId: number,
    @Param('keyId') keyId: number,
    @Body() keyvalue: any,
    @Request() req,
  ): Promise<ResponseBody> {
    const value = keyvalue.keyvalue;
    const valueId = keyvalue.valueId;
    const currentUser = req.cookies.token;
    const data = await (
      await this.namespaceService.editKeyValueOnlanguage(
        branchId,
        languageId,
        keyId,
        value,
        valueId,
        currentUser,
        new Date(),
      )
    ).raw;
    const user = req.cookies.token;
    this.logger.info(
      // eslint-disable-next-line max-len
      `user ${user} edit key value, key id: ${keyId}, branch id: ${branchId}, language id: ${languageId}, value is ${JSON.stringify(
        keyvalue,
      )}.`,
    );
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
  async addKeyValue(@Body() keyvalue: any, @Request() req) {
    const branchId = keyvalue.branchId;
    const namespaceId = keyvalue.namespaceId;
    const keyId = keyvalue.keyId;
    const keyName = keyvalue.keyName;
    const data: [] = keyvalue.kv;
    const currentUser = req.cookies.token;
    //logger.info(`view keyvalue: key id: ${keyId}, key name: ${keyName}`);
    // 如果key id 有值，则为修改，否则为增加
    let msg = '';
    try {
      await this.namespaceService.editKeyValue(branchId, namespaceId, keyId, keyName, data, currentUser, new Date());
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    this.logger.info(
      // eslint-disable-next-line max-len
      `user ${currentUser} edit key, key id: ${keyId}, branch id: ${branchId}, namespace id: ${namespaceId}, key name: ${keyName}, key value: ${JSON.stringify(
        data,
      )}.`,
    );
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
  async editKeyname(@Body() data: any, @Request() req) {
    const keyId = data.keyId;
    const keyName = data.keyName;
    let res: any;
    let msg = '';
    const currentUser = req.cookies.token;
    try {
      res = await this.namespaceService.editKeyname(keyId, keyName, currentUser, new Date());
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    this.logger.info(
      // eslint-disable-next-line max-len
      `user ${currentUser} edit key name, key id: ${keyId}, key name: ${keyName}`,
    );
    return ResponseBody.okWithData(res[0]);
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
  @Permission(PermissionCtl.DELETE_KEY)
  async deleteKey(@Param('keyId') keyId: number, @Request() req) {
    let msg = '';
    const currentUser = req.cookies.token;
    try {
      // todo before delete key record,will verify the relationship between Branch and key
      await this.namespaceService.deleteKey(keyId, currentUser);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    this.logger.info(`user ${currentUser} delete key, key id: ${keyId}`);
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
  async deleteNamespace(@Param('namespaceId') namespaceId: number, @Request() req) {
    let msg = '';
    const currentUser = req.cookies.token;
    try {
      await this.namespaceService.deleteNamespace(namespaceId, currentUser);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    this.logger.info(`user ${currentUser} delete namespace, namespace id: ${namespaceId}`);
    return ResponseBody.okWithMsg('success');
  }

  /**
   * @description
   *  获取一个key的详细信息
   * @request
   *  url: http://localhost:5000/namespace/view/keyId/26
   *  method: Get
   * @returns
   * {
    "statusCode": 0,
    "data": {
        "keyName": {
            "id": 16,
            "key_id": 13,
            "name": "h2w",
            "modifier": "lw",
            "modify_time": "2020-06-22T09:23:59.550Z",
            "commit_id": "368a706ffa39"
        },
        "value": [
            {
                "id": 21,
                "value": "hao2",
                "key_id": 13,
                "language_id": 1,
                "merge_id": null,
                "modifier": "lw",
                "midify_time": "2020-06-22T09:23:58.553Z",
                "latest": true,
                "commit_id": "0154a5a9-b208-0e3c-0a85-368a706ffa36"
            },
            {
                "id": 22,
                "value": "好2",
                "key_id": 13,
                "language_id": 2,
                "merge_id": null,
                "modifier": "lw",
                "midify_time": "2020-06-22T09:23:58.554Z",
                "latest": true,
                "commit_id": "0154a5a9-b208-0e3c-0a85-368a706ffa36"
            }
        ]
    },
    "success": true,
    "timestamp": 1592876495916
    }
   */
  @Get('/view/keyId/:keyId')
  async getKeyDetailInfo(@Param('keyId') keyId: number) {
    let msg = '';
    let data: any;
    try {
      data = await this.namespaceService.getKeyDetailInfo(keyId);
    } catch (error) {
      msg = error.message;
      return ResponseBody.error(msg, 500);
    }
    return ResponseBody.okWithData(data);
  }

  @Get('/sync_old_data/old_ns_id/:onid/new_ns_id/:nnid/:ckcode')
  async syncOldData(@Param('onid') onid: number, @Param('nnid') nnid: number, @Param('ckcode') ckcode: number) {
    // 需要传入老数据的 namespace id 和新工程的 namespace id
    let data = '';
    try {
      data = await this.namespaceService.syncOldData(onid, nnid, ckcode);
    } catch (error) {
      return ResponseBody.error(error.message, 500);
    }
    return ResponseBody.okWithMsg(data);
  }

  /**
   * 客户端获取key value
   * @param ProjectName 工程名
   * @param branchName 分支名
   * @retuen
   * {"data":{
   *   "en":{
   *      "backend":{}
   *      "common":{}
   *    },
   *   "zh":{}
   * }}
   */
  @Get('/json/project/:projectName/branch/:branchName')
  async getProjectData(@Param('projectName') projectName: string, @Param('branchName') branchName: string) {
    let data = {};
    try {
      data = await this.namespaceService.getProjectData(projectName, branchName);
    } catch (error) {
      return ResponseBody.error(error.message, 500);
    }
    return data;
  }

  /**
   * 老数据排序
   */
  @Post('/json/oldnew/diff')
  async oldData(@Body() data: any) {
    const odata = data.oldFile;
    const ndata = data.newFile;
    try {
      data = await this.namespaceService.oldNewDiff(odata, ndata);
    } catch (error) {
      return ResponseBody.error(error.message, 500);
    }
    return data;
  }

  sort(i, j) {
    const r1 = i.keyName;
    const r2 = j.keyName;
    if (r1 < r2) {
      return -1;
    }
    if (r1 > r2) {
      return 1;
    }
    return 0;
  }
}
