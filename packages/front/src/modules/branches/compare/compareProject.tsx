import React, { useState, useEffect } from 'react';
import * as css from '../style/compare.modules.less';
import { Select, Col, Row, Button, Form } from 'antd';
import { SwapOutlined, PlusOutlined } from '@ant-design/icons';
import { ajax } from '@ofm/ajax';
import DiffItem from './diffItem';

const CompareProject = () => {
  const [form] = Form.useForm();
  const [branchList, setBranchList] = useState<any>([]);
  const [diffData, setDiffData] = useState<any>([]);

  useEffect(() => {
    getBranchList();
  }, []);

  const getBranchList = () => {
    ajax.get('/branch/list').then(result => {
      const {
        data: { statusCode, data },
      } = result;
      if (statusCode === 0) {
        setBranchList(data);
      }
    });
  };

  const onCreateMerge = () => {
    form.validateFields().then(values => {
      if (!values.outOfDate) {
        ajax.post('/branch/compare', values).then(result => {
          const {
            data: { statusCode, data },
          } = result;
          if (statusCode === 0) {
            setDiffData(data);
          }
        });
      }
    });
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
      <div className={css.diffTitle}>Diff ({diffData.length})</div>
      <DiffItem />
    </>
  );
};

export default CompareProject;
