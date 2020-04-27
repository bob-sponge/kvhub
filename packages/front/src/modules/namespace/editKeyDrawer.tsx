import React from 'react';
import { Input, Drawer, Form, Col, Row, Button } from 'antd';
import * as css from './styles/namespace.modules.less';

const { TextArea } = Input;

interface EditKeyDrawerProps {
  onClose: Function;
  visible: boolean;
}

const EditKeyDrawer: React.FC<EditKeyDrawerProps> = ({ onClose, visible }: EditKeyDrawerProps) => {
  return (
    <div>
      <Drawer
        title="ACTIVITY_LINE_NOT_EXITS"
        width={590}
        onClose={() => onClose()}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}>
            <Button onClick={() => onClose()} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={() => onClose()} type="primary">
              Submit
            </Button>
          </div>
        }>
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={
                  <div>
                    <span className={css.label}>EN</span>
                    <span>English</span>
                    <span className={css.refLanguage}>(Reference Language)</span>
                  </div>
                }
                rules={[{ required: true, message: 'Please enter user name' }]}>
                <TextArea value={'Open Industrial Intelligent Monitoring for you'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={
                  <div>
                    <span className={css.label}>DE</span>
                    <span>Deutsch</span>
                  </div>
                }
                rules={[{ required: true, message: 'Please enter user name' }]}>
                <TextArea value="Open Industrial Intelligent Monitoring for you" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={
                  <div>
                    <span className={css.label}>CN</span>
                    <span>Chinese</span>
                  </div>
                }
                rules={[{ required: true, message: 'Please enter user name' }]}>
                <TextArea value="为您开启工业智能监控" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default EditKeyDrawer;
