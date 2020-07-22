import React, { useState, useEffect } from 'react';
import * as css from '../style/compare.modules.less';
import Container from '../../../container';
import CompareObject from './compareProject';
import * as Api from '../../../api/branch';
import { projectDetailApi } from '../../../api/index';

interface CompareProps {
  match: any;
}

const Compare: React.SFC<CompareProps> = (props: CompareProps) => {
  const {
    match: {
      params: { id },
    },
  } = props;
  const [navs, setNavs] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [projectDetail, setProjectDetail] = useState<any>({});

  useEffect(() => {
    getBranchDetail(id);
    getProjectDetail(id);
  }, [id]);

  useEffect(() => {
    const { name } = projectDetail;
    setNavs([
      {
        name: 'Home',
        url: '/',
      },
      {
        name: 'Project Dashboard',
        url: '/dashboard',
      },
      {
        name,
        url: '',
      },
    ]);
  }, [projectDetail]);

  const getProjectDetail = async (projectId: any) => {
    let result = await projectDetailApi(projectId);
    const { success, data } = result;
    if (success && data) {
      setProjectDetail(data);
    }
  };

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
    <Container navs={navs}>
      <div className={css.compareWapper}>
        <div className={css.commonTitle}>Compare</div>
        <CompareObject detail={detail} />
      </div>
    </Container>
  );
};

export default Compare;
