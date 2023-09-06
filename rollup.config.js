import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { fileURLToPath } from 'url';
import ts from 'rollup-plugin-typescript2';
// 将json 文件转换为ES6 模块
import json from '@rollup/plugin-json';
// 在node_模块中查找并绑定第三方依赖项（将第三方依赖打进包里）
import resolve from '@rollup/plugin-node-resolve';
// 将CommonJS模块转换为ES6
import commonjs from '@rollup/plugin-commonjs';
// rollup babel插件 兼容新特性
import babel from 'rollup-plugin-babel';
// 优化代码
import { terser } from 'rollup-plugin-terser';
// 热更新服务
// import livereload from 'rollup-plugin-livereload';
import dts from 'rollup-plugin-dts';
// import eslint from '@rollup/plugin-eslint'
// 判断是是否为生产环境
// 开发环境or生产环境
const isPro = function () {
  return process.env.NODE_ENV === 'production';
};
const SRC_DIR = './src';
const GIT_IGNORE = '.gitignore';
const extensions = ['.jsx', '.ts', '.tsx'];
const generateConfig = (input, output, plugins = []) => {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  return {
    input,
    output,
    plugins: [
      resolve(), //快速查找外部模块
      commonjs(), //将CommonJS转换为ES6模块
      json(), //将json转换为ES6模块
      //ts编译插件
      ts({
        tsconfig: path.resolve(dirname, './tsconfig.json'),
        extensions,
      }),
      babel({
        runtimeHelpers: true,
        exclude: ['node_modules/**', 'src/plugins/**.js'],
      }),
      // !isPro() &&
      //   livereload({
      //     watch: ['dist', 'examples', 'src/**/*'],
      //     verbose: false, // 关闭冗长的重新编译成功后的控制台输出
      //   }),
      isPro() && terser(),
      ...plugins,
    ],
  };
};

const configList = [
  generateConfig(path.resolve('./src/index.ts'), [
    {
      file: './lib/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: './lib/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
  ]),
  {
    // 生成 .d.ts 类型声明文件
    input: path.resolve('./src/index.ts'),
    output: {
      file: './lib/index.d.ts',
      format: 'es',
      // sourcemap: false,
    },
    plugins: [
      dts({ respectExternal: true }),
      // del({
      //   targets: ['./lib/src'],
      //   hook: 'buildEnd',
      // }),
      // {
      //   name: 'move-dts',
      //   buildEnd() {
      //     // console.log('test');
      //   },
      // },
    ],
  },
];

const files = shelljs
  .ls(`${SRC_DIR}/**/*.@(js|ts)`)
  .filter((path) => typeof path === 'string');

console.log('---------------------------');
console.log(shelljs.ls(`${SRC_DIR}/**/*.@(js|ts)`));
console.log();
console.log(files);

files.forEach((file) => {
  const filename = path.basename(file).replace(/\.\w+$/, '');
  if (filename === 'index') return;

  configList.unshift(
    generateConfig(
      path.resolve(file),
      [
        {
          file: `${path.resolve('.', filename, 'index')}.esm.js`,
          format: 'esm',
          sourcemap: true,
        },
        {
          file: `${path.resolve('.', filename, 'index')}.js`,
          format: 'cjs',
          sourcemap: true,
        },
      ],
      [
        {
          name: 'add-gitignore',
          buildEnd() {
            const gitIgnoreList = fs
              .readFileSync(GIT_IGNORE)
              .toString()
              .split('\n');
            if (!gitIgnoreList.includes(filename)) {
              fs.writeFileSync(
                GIT_IGNORE,
                gitIgnoreList.concat(filename).join('\n'),
              );
            }
          },
        },
      ],
    ),
    {
      // 生成 .d.ts 类型声明文件
      input: path.resolve(file),
      output: {
        file: `${path.resolve('.', filename, 'index')}.d.ts`,
        format: 'es',
      },
      plugins: [dts({ respectExternal: true })],
    },
  );
});
export default configList;
