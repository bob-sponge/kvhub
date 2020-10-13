import React, { useState, useEffect } from 'react';
import { Drawer, Button, Form, Select, Col, Row } from 'antd';
import * as css from './styles/addorEdit.modules.less';
import { CheckOutlined } from '@ant-design/icons';
import { SwapOutlined } from '@ant-design/icons';
import * as Api from '../../api/languages';
import * as MergeSApi from '../../api/mergeRequest';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
  getMergeRequest: Function;
  filter: any;
  id: string;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible, id, getMergeRequest } = props;
  const [form] = Form.useForm();
  const [branchList, setBranchList] = useState<any>([]);
  const [crosMerge, setCrosMerge] = useState(false);

  useEffect(() => {
    getBranchList();
  }, []);

  const getBranchList = async () => {
    let result = await Api.branchListApi(id);
    const { success, data } = result;
    if (success && data) {
      setBranchList(data);
    }
  };

  const handleAdd = () => {
    form.validateFields().then(async values => {
      if (values) {
        const { destination, source } = values;
        const detail = {
          sourceBranchId: source,
          targetBranchId: destination,
          crosMerge,
          projectId: id,
        };
        await MergeSApi.branchMergeSaveApi(detail);
        getMergeRequest();
      }
    });
  };

  const renderFooter = () => {
    return (
      <div className={css.drawerFooter}>
        <Button onClick={() => setVisible(false)}>Cancel</Button>
        <Button icon={<CheckOutlined />} type="primary" onClick={handleAdd}>
          Submit
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      title="Create Branch"
      placement="right"
      closable={true}
      onClose={() => setVisible(false)}
      visible={visible}
      width={590}
      destroyOnClose={true}
      className={css.addProjectDrawer}
      footer={renderFooter()}>
      <Form form={form} name="basic" layout="vertical" initialValues={{ remember: true }}>
        <Row>
          <Col span={8}>
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
          <Col span={6}>
            <div className={css.operation}>
              <div className={css.title} onClick={() => setCrosMerge(!crosMerge)}>
                <SwapOutlined />
                <span>Exchange</span>
              </div>
              <div className={css.content}>
                {crosMerge ? <div className={css.trangleLeft} /> : <div className={css.circle} />}
                <div className={css.square} />
                <div className={css.trangle} />
              </div>
            </div>
          </Col>
          <Col span={8}>
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
    </Drawer>
  );
};

export default AddOrEditProject;
