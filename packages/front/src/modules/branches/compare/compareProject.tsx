import React, { useState, useEffect, useCallback } from 'react';
import * as css from '../style/compare.modules.less';
import { Select, Col, Row, Button, Form, Spin, message } from 'antd';
import { SwapOutlined, PlusOutlined } from '@ant-design/icons';
import DiffItem from './diffItem';
import * as Api from '../../../api/branch';
import clsx from 'clsx';
import { history as browserHistory } from '@ofm/history';

interface CompareProjectProps {
  match?: any;
  detail: any;
}

const CompareProject: React.SFC<CompareProjectProps> = (props: CompareProjectProps) => {
  const [form] = Form.useForm();
  const { detail } = props;
  const [branchList, setBranchList] = useState<any>([]);
  const [diffData, setDiffData] = useState<any>([]);
  const [isChange, setIsChange] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (detail && detail.projectId) {
      getBranchList(detail.projectId);
    }
  }, [detail]);

  const getBranchList = async (projectId: number) => {
    setLoading(true);
    let result = await Api.branchListApi(projectId);
    const { success, data } = result;
    setLoading(false);
    if (success && data) {
      setBranchList(data);
    }
  };

  useEffect(() => {
    if (detail && detail.id) {
      form.setFieldsValue({ source: detail.id });
    }
  }, [detail]);

  const onCompare = () => {
    form.validateFields().then(values => {
      if (values && !values.outOfDate) {
        getDiffData(values);
      }
    });
  };

  const onCreateMerge = useCallback(() => {
    form.validateFields().then(values => {
      if (values && !values.outOfDate) {
        let params = {
          sourceBranchId: values.source,
          targetBranchId: values.destination,
          crosMerge: isChange,
          projectId: detail.projectId,
        };
        getCreateMerge(params);
      }
    });
  }, [detail]);

  const getCreateMerge = async (params: any) => {
    setLoading(true);
    let result = await Api.createMergeApi(params);
    const { success, data } = result;
    setLoading(false);
    if (success && data) {
      getCreatMergeQuest(data);
    }
  };

  const getCreatMergeQuest = async (dataId: number) => {
    setLoading(true);
    let result = await Api.createMergeRequestApi(dataId);
    const { success, data } = result;
    setLoading(false);
    if (success && data) {
      message.success(data);
      browserHistory.push(`/mergeRequest/detail/${dataId}`);
    }
  };

  const getDiffData = async (params: any) => {
    setLoading(true);
    let result = await Api.branchCompareApi(params);
    const { success, data } = result;
    setLoading(false);
    if (success && data) {
      setDiffData(data);
    }
  };

  const handleChange = () => {
    setIsChange(!isChange);
  };

  return (
    <Spin spinning={loading}>
      <div className={css.comparePanel}>
        <Form form={form} name="basic" layout="vertical" initialValues={{ remember: true }}>
          <Row>
            <Col span={11}>
              <Form.Item
                label="Source"
                name="source"
                rules={[{ required: true, message: 'Please select source branch' }]}>
                <Select style={{ width: '100%' }}>
                  {branchList &&
                    branchList.length > 0 &&
                    branchList.map((item: any) => {
                      return (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={2}>
              <div className={css.operation} onClick={handleChange}>
                <div className={css.title}>
                  <SwapOutlined />
                  <span>Exchange</span>
                </div>
                <div className={clsx(css.content, isChange && css.transform)}>
                  {!isChange && <div className={css.circle} />}
                  {isChange && <div className={css.trangle} style={{ transform: 'rotate(180deg)' }} />}
                  <div className={css.square} />
                  <div className={css.trangle} />
                </div>
              </div>
            </Col>
            <Col span={11}>
              <Form.Item
                label="Destination"
                name="destination"
                rules={[{ required: true, message: 'Please select destination branch' }]}>
                <Select style={{ width: '100%' }}>
                  {branchList &&
                    branchList.length > 0 &&
                    branchList.map((item: any) => {
                      return (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className={css.createMerge}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCompare} style={{ marginRight: 16 }}>
            Compare
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateMerge}>
            Create Merge Request
          </Button>
        </div>
      </div>
      <>
        <div className={css.diffTitle}>Diff ({diffData.length})</div>
        {diffData &&
          diffData.length > 0 &&
          diffData.map((item: any) => {
            return <DiffItem diffData={item} isChange={isChange} />;
          })}
      </>
    </Spin>
  );
};

export default CompareProject;
