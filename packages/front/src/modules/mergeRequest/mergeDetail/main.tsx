import React, { useState, useEffect, useCallback } from 'react';
import * as css from '../styles/merge.modules.less';
import { Button, message, Modal } from 'antd';
import Container from '../../../container';
import DiffItem from './diffItem';
import { history } from '@ofm/history';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  CloseOutlined,
  FullscreenExitOutlined,
  SwapOutlined,
  SwapRightOutlined,
} from '@ant-design/icons';
import * as Api from '../../../api/mergeRequest';

interface ContainerProps {
  children?: React.ReactNode;
  match: any;
}

const Merge = (props: ContainerProps) => {
  const { match } = props;
  const branchMergeId = match.params.branchMergeId;
  const [diffList, setDiffList] = useState([]);
  const [mergeDetail, setMergeDetail] = useState<any>([]);
  const [mergeList, setMergeList] = useState<any>([]);

  useEffect(() => {
    getBranchMergeInfo();
    branchMergeDiffApi();
  }, []);

  const getBranchMergeInfo = async () => {
    const result = await Api.branchMergeInfoApi(branchMergeId);
    const { success, data } = result;
    if (success && data) {
      setMergeDetail(data);
    }
  };

  const branchMergeDiffApi = async () => {
    const result = await Api.branchMergeDiffApi(branchMergeId);
    const { success, data } = result;
    if (success && data) {
      setDiffList(data);
      setMergeList(data);
    }
  };

  const goBack = () => {
    history.goBack();
  };

  const handleSubmit = useCallback(async () => {
    const { id, projectId } = mergeDetail;
    let isSelected = true;
    mergeList.map((item: any) => {
      if (item.mergeDiffKey.selectBranchId === null) {
        isSelected = false;
      }
    });
    if (!isSelected) {
      Modal.error({
        title: 'Please select diff key',
      });
      return;
    }
    let params = {
      mergeId: id,
      branchMergeDiffList: mergeList,
    };
    const result = await Api.branchMergeApi(params);
    const { success, data } = result;
    if (success) {
      message.success(data);
      history.push(`/kvhub/mergeRequest/${projectId}`);
    }
  }, [mergeDetail, mergeList]);

  const handleRefuse = async () => {
    const { id, projectId } = mergeDetail;
    const result = await Api.branchMergeRefuseApi(id);
    const { success, data } = result;
    if (success) {
      message.success(data);
      history.push(`/kvhub/mergeRequest/${projectId}`);
    }
  };

  return (
    <Container>
      <div className={css.mergeWapper}>
        <div className={css.commonTitle}>
          <div className={css.title}>
            {mergeDetail.sourceBranchName}
            {mergeDetail.crosMerge ? (
              <SwapOutlined className={css.mergeIcon} />
            ) : (
              <SwapRightOutlined className={css.mergeIcon} />
            )}
            {mergeDetail.targetBranchName}
          </div>
          <div className={css.buttonList}>
            <Button onClick={goBack}>
              <ArrowLeftOutlined />
              Back
            </Button>
            <Button>
              <DownloadOutlined />
              Download
            </Button>
            <Button onClick={handleRefuse}>
              <CloseOutlined />
              Refused
            </Button>
            <Button onClick={handleSubmit}>
              <FullscreenExitOutlined />
              Submit Merge
            </Button>
          </div>
        </div>
        <div className={css.diffTitle}>
          {`Diff(${diffList && diffList.length})`}
          <span className={css.select}>{'Please select the results you want to merge'}</span>
        </div>
        {mergeList &&
          mergeList.length > 0 &&
          mergeList.map((item: any, index: number) => {
            return (
              <DiffItem
                diffData={item}
                key={index}
                diffIndex={index}
                mergeList={mergeList}
                setMergeList={setMergeList}
              />
            );
          })}
      </div>
    </Container>
  );
};

export default Merge;
