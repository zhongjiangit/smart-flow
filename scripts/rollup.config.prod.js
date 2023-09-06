// npm install -D rollup-plugin-filesize
import baseConfig from './rollup.config.base.js';
import filesize from 'rollup-plugin-filesize';
// import { terser } from 'rollup-plugin-terser';

export default baseConfig.map((conf) => {
  return {
    ...conf,
    plugins: [...conf.plugins],
  };
});
