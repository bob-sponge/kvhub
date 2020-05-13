export const cardListData: Array<any> = [
  {
    id: 1,
    name: 'Pubg-Design',
    languages: ['EN', 'ZH', 'DE'],
    modifier: 'bsw',
    time: 1587826534519,
    translateKeysNumber: 13543456,
    translatedKeys: [11, 30],
    keysNumber: 13543456,
    key: [11, 12, 14],
  },
  {
    id: 2,
    name: 'Dpp-global-release-2018-10-22',
    languages: ['EN', 'ZH'],
    modifier: 'bsw',
    time: 1587826534519,
    translateKeysNumber: 1354,
    translatedKeys: [11, 30],
    keysNumber: 2865,
    key: [11, 12, 14],
  },
  {
    id: 3,
    name: 'Pubg-Design',
    languages: ['EN', 'DE'],
    modifier: 'bsw',
    time: 1587826534519,
    translateKeysNumber: 1354,
    translatedKeys: [11, 30],
    keysNumber: 2334,
    key: [11, 12, 14],
  },
  {
    id: 4,
    name: 'Pubg-Design',
    languages: ['EN', 'DE'],
    modifier: 'bsw',
    time: 1587826534519,
    translateKeysNumber: 1354,
    translatedKeys: [11, 30],
    keysNumber: 2334,
    key: [11, 12, 14],
  },
];

export const doneColor = '#2BAF82';

export const processColor = '#43BDE0';

export const formatNumber = (num: number) => {
  let str = num.toString();
  let reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
  return str.replace(reg, '$1,');
};

export const timeAgo = (dateTimeStamp: number) => {
  let minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
  let hour = minute * 60;
  let day = hour * 24;
  let week = day * 7;
  let month = day * 30;
  let now = new Date().getTime(); //获取当前时间毫秒
  let diffValue = now - dateTimeStamp; //时间差

  if (diffValue < 0) {
    return;
  }
  let result = '';
  let minC = diffValue / minute; //计算时间差的分，时，天，周，月
  let hourC = diffValue / hour;
  let dayC = diffValue / day;
  let weekC = diffValue / week;
  let monthC = diffValue / month;
  if (monthC >= 1 && monthC <= 3) {
    result = `${Math.ceil(monthC)} month go`;
  } else if (weekC >= 1 && weekC <= 3) {
    result = `${Math.ceil(weekC)} week ago`;
  } else if (dayC >= 1 && dayC <= 6) {
    result = `${Math.ceil(dayC)} day ago`;
  } else if (hourC >= 1 && hourC <= 23) {
    result = `${Math.ceil(hourC)} hour ago`;
  } else if (minC >= 1 && minC <= 59) {
    result = `${Math.ceil(minC)} minute ago`;
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = 'latest';
  } else {
    let datetime = new Date();
    datetime.setTime(dateTimeStamp);
    let Nyear = datetime.getFullYear();
    let Nmonth = datetime.getMonth() + 1 < 10 ? '0' + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    let Ndate = datetime.getDate() < 10 ? '0' + datetime.getDate() : datetime.getDate();
    let Nhour = datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours();
    let Nminute = datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes();
    let Nsecond = datetime.getSeconds() < 10 ? '0' + datetime.getSeconds() : datetime.getSeconds();
    result = `${Nyear}-${Nmonth}-${Ndate} ${Nhour}:${Nminute}:${Nsecond}`;
  }
  return result;
};
