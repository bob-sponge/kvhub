import React from 'react';
import * as css from '../style/compare.modules.less';
import { Select, Col, Row, Button } from 'antd';
import { SwapOutlined, PlusOutlined } from '@ant-design/icons';

const CompareProject = () => {
  return (
    <div className={css.comparePanel}>
      <div className={css.panel}>
        <div className={css.source}>
          <div className={css.panelTitle}>Scource</div>
          <div className={css.panelContent}>
            <Row>
              <Col span={10}>Dpp-global-release-2018-10-22</Col>
              <Col span={14}>
                <Select style={{ width: '100%' }}>
                  <Select.Option value={1}>feature/dev-team2-oi</Select.Option>
                </Select>
              </Col>
            </Row>
          </div>
        </div>
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
        <div className={css.source}>
          <div className={css.panelTitle}>Destination</div>
          <div className={css.panelContent}>
            <Row>
              <Col span={10}>Dpp-global-release-2018-10-22</Col>
              <Col span={14}>
                <Select style={{ width: '100%' }}>
                  <Select.Option value={1}>feature/dev-team2-oi</Select.Option>
                </Select>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <div className={css.createMerge}>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Marge Request
        </Button>
      </div>
    </div>
  );
};

export default CompareProject;
