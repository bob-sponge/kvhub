import React, { useEffect, useState } from 'react';
import * as css from './style/index.modules.less';
import * as Api from '../../api/user';

const profileInfo: React.SFC = () => {
  const [userInfo, setUserInfo] = useState<any>({});

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let useId = Number(sessionStorage.getItem('userId'));
    const result = await Api.getUserInfoApi(useId);
    const { success, data } = result;
    if (success) {
      setUserInfo(data);
    }
  };

  return (
    <div className={css.profileInfo}>
      <div className={css.profileTitle}>Basic Information</div>
      <div className={css.profileItemList}>
        <div className={css.itemList}>
          <div className={css.title}>User Name</div>
          <div className={css.content}>{userInfo.name}</div>
        </div>
        <div className={css.itemList}>
          <div className={css.title}>Department</div>
          <div className={css.content}>{userInfo.department}</div>
        </div>
        <div className={css.itemList}>
          <div className={css.title}>User Type</div>
          <div className={css.content}>{userInfo.admin === 1 ? 'General' : 'Admin'}</div>
        </div>
        <div className={css.itemList}>
          <div className={css.title}>Login Type</div>
          <div className={css.content}>{userInfo.type === '1' ? 'LADP' : 'Normal'}</div>
        </div>
      </div>
    </div>
  );
};

export default profileInfo;
