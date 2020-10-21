import React, { useState, useEffect } from 'react';
import * as css from '../style/compare.modules.less';
import Container from '../../../container';
import CompareObject from './compareProject';
import * as Api from '../../../api/branch';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface CompareProps {
  match: any;
}

const Compare: React.FC<CompareProps> = (props: CompareProps) => {
  const {
    match: {
      params: { id },
    },
  } = props;
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    getBranchDetail(id);
  }, [id]);

  const getBranchDetail = async (branchId: any) => {
    if (id) {
      let result = await Api.branchDetailApi(branchId);
      const { success, data } = result;
      if (success) {
        setDetail(data);
      }
    }
  };

  return (
    <Container>
      <div className={css.compareWapper}>
        <div className={css.commonTitle}>
          <div className={css.title}>Compare</div>
          <Button onClick={() => window.history.go(-1)} icon={<ArrowLeftOutlined />}>
            Back
          </Button>
        </div>
        <CompareObject detail={detail} />
      </div>
    </Container>
  );
};

export default Compare;
