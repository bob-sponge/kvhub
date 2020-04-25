import React from 'react';
import { Drawer, Button } from 'antd';
import * as css from './style/addOrEditProject.modules.less';
import { CheckOutlined } from '@ant-design/icons';

interface AddOrEditProjectProps {
  visible: boolean;
  setVisible: Function;
}

const AddOrEditProject: React.SFC<AddOrEditProjectProps> = (props: AddOrEditProjectProps) => {
  const { visible, setVisible } = props;
  const onClose = () => {
    setVisible(false);
  }

  const renderFooter = () => {
    return (
      <div className={css.drawerFooter}>
        <Button>Cancel</Button>
        <Button icon={<CheckOutlined />} type="primary">Submit</Button>
      </div>
    )
  }
  return (
    <Drawer
      title="Add New Project"
      placement="right"
      closable={true}
      onClose={onClose}
      visible={visible}
      footer={renderFooter()}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Drawer>
  )
};

export default AddOrEditProject;