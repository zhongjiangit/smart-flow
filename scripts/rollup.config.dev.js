// npm install -D rollup-plugin-serve rollup-plugin-livereload
import baseConfig from './rollup.config.base';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
// 热更新服务
// import livereload from 'rollup-plugin-livereload';
import dts from 'rollup-plugin-dts';

export default {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    serve({
      port: 8080,
      contentBase: ['dist', 'examples/browser'],
      openPage: 'index.html',
    }),
    livereload({
      watch: 'examples/browser',
    }),
  ],
};
