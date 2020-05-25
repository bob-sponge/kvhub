export const doneColor = '#2BAF82';

export const processColor = '#43BDE0';

export const toThousands = (nums: number) => {
  let num = (nums || 0).toString();
  let result = '';
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return result;
};

export const getPercent = (num: number, total: number) => {
  const percent = Math.floor((num / total) * 100);
  if (percent === 0 && num !== 0) {
    return {
      text: '1%',
      percent: 1,
    };
  } else if (percent === 100) {
    return {
      text: 'Done 100%',
      percent: 100,
    };
  } else {
    return {
      text: `${percent}%`,
      percent: percent,
    };
  }
};
