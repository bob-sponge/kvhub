import React, { useState, useEffect } from 'react';
import * as css from '../styles/merge.modules.less';
import { Button } from 'antd';
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

  useEffect(() => {
    getBranchMergeInfo();
    branchMergeDiffApi();
  }, []);

  const getBranchMergeInfo = async () => {
    const res = await Api.branchMergeInfoApi(branchMergeId);
    setMergeDetail(res && res.data);
  };

  const branchMergeDiffApi = async () => {
    const res = await Api.branchMergeDiffApi(branchMergeId);
    setDiffList(res && res.data);
  };

  const goBack = () => {
    history.goBack();
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
              {'Back'}
            </Button>
            <Button>
              <DownloadOutlined />
              {'Download'}
            </Button>
            <Button>
              <CloseOutlined />
              {'Refused'}
            </Button>
            <Button>
              <FullscreenExitOutlined />
              {'Submit Merge'}
            </Button>
          </div>
        </div>
        <div className={css.diffTitle}>
          {`Diff(${diffList && diffList.length})`}
          <span>{'Please select the results you want to merge'}</span>
        </div>
        {diffList &&
          diffList.map((item, index) => {
            return <DiffItem item={item} key={index} />;
          })}
      </div>
    </Container>
  );
};

export default Merge;
