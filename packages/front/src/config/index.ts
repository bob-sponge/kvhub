import dev from './dev.yaml';
import dist from './dist.yaml';
import local from './local.yaml';
const deepExtend = require('deep-extend');

let config: any;

if (process.env.NODE_ENV === 'development') {
  config = deepExtend(dev, local);
} else {
  config = dist;
}

process.conf = config;
