import React, { useState, useEffect, useCallback } from 'react';
import * as css from '../style/compare.modules.less';
import { Select, Col, Row, Button, Form } from 'antd';
import { SwapOutlined, PlusOutlined } from '@ant-design/icons';
import DiffItem from './diffItem';
import * as Api from '../../../api/branch';

interface CompareProjectProps {
  id: any;
  match?: any;
}

const CompareProject: React.SFC<CompareProjectProps> = (props: CompareProjectProps) => {
  const { id } = props;
  const [form] = Form.useForm();
  const [detail, setDetail] = useState<any>(null);
  const [branchList, setBranchList] = useState<any>([]);
  const [diffData, setDiffData] = useState<any>([]);

  const getBranchDetail = useCallback(async () => {
    if (id) {
      let result = await Api.branchDetailApi(id);
      const { success, data } = result;
      if (success) {
        setDetail(data);
      }
    }
  }, [id]);

  useEffect(() => {
    getBranchList();
  }, []);

  useEffect(() => {
    getBranchDetail();
  }, [getBranchDetail]);

  const getBranchList = async () => {
    let result = await Api.branchListApi();
    const { success, data } = result;
    if (success && data) {
      setBranchList(data);
    }
  };

  useEffect(() => {
    if (detail && detail.id) {
      form.setFieldsValue({ source: 45 });
      form.setFieldsValue({ destination: 46 });
    }
  }, [detail]);

  const onCreateMerge = () => {
    form.validateFields().then(values => {
      if (values && !values.outOfDate) {
        getDiffData(values);
      }
    });
  };

  const getDiffData = async (params: any) => {
    let result = await Api.branchCompareApi(params);
    const { success, data } = result;
    if (success && data) {
      setDiffData(data);
    }
  };

  return (
    <>
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
              <div className={css.operation}>
                <div className={css.title}>
                  <SwapOutlined />
                  <span>Exchange</span>
                </div>
                <div className={css.content}>
                  <div className={css.circle} />
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
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateMerge}>
            Create Merge Request
          </Button>
        </div>
      </div>
      {diffData && diffData.length !== 0 && (
        <>
          <div className={css.diffTitle}>Diff ({diffData.length})</div>
          <DiffItem diffData={diffData} />
        </>
      )}
    </>
  );
};

export default CompareProject;
