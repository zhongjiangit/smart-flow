import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { fileURLToPath } from 'url';
import ts from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
// 将json 文件转换为ES6 模块
import json from '@rollup/plugin-json';
// 在node_模块中查找并绑定第三方依赖项（将第三方依赖打进包里）
import resolve from '@rollup/plugin-node-resolve';
// 将CommonJS模块转换为ES6
import commonjs from '@rollup/plugin-commonjs';
// 和webpack中 resolve.alias 功能相似，解析路径
import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';
// 优化代码
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import eslint from '@rollup/plugin-eslint';
import clear from 'rollup-plugin-clear';
import packageJson from '../package.json' assert { type: 'json' };

const SRC_DIR = './src';
const GIT_IGNORE = '.gitignore';
const extensions = ['.jsx', '.ts', '.tsx'];
const pkgName = 'smart.flowchart';
// 打包处理的文件，添加的备注信息
const banner =
  '/*!\n' +
  ` * ${packageJson.name} v${packageJson.version}\n` +
  ` * (c) 2022-${new Date().getFullYear()} ${packageJson.author}\n` +
  ' * Released under the ISC License.\n' +
  ' */';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const files = shelljs
  .ls(`${SRC_DIR}/**/*.@(js|ts)`)
  .filter((path) => typeof path === 'string');

const generateConfig = (input, output, plugins = []) => {
  return {
    input,
    output,
    plugins: [
      resolve(), //快速查找外部模块
      commonjs(), //将CommonJS转换为ES6模块
      json(), //将json转换为ES6模块
      ts({
        tsconfig: path.resolve(dirname, '../tsconfig.json'),
        extensions,
      }),
      clear({
        targets: ['lib', 'es', 'dist'],
      }),
      alias(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development',
        ),
        preventAssignment: true,
      }),
      eslint({
        throwOnError: true, // 抛出异常并阻止打包
        include: ['src/**'],
        exclude: ['node_modules/**'],
      }),
      babel({
        exclude: ['node_modules/**'],
      }),
      ...plugins,
    ],
    external: ['react', 'react-dom'],
  };
};

const configList = [
  generateConfig(path.resolve(dirname, '../src/index.ts'), [
    {
      file: `./dist/${pkgName}.umd.js`,
      format: 'umd',
      name: pkgName,
      banner,
    },
    {
      file: `./dist/${pkgName}.umd.min.js`,
      format: 'umd',
      name: pkgName,
      banner,
      plugins: [terser()],
    },
    {
      file: `./lib/${pkgName}.cjs.js`,
      format: 'cjs',
      name: pkgName,
      banner,
      plugins: [terser()],
    },
    {
      file: `./es/${pkgName}.esm.js`,
      format: 'es',
      name: pkgName,
      banner,
      plugins: [terser()],
    },
  ]),
  {
    // 生成 .d.ts 类型声明文件
    input: path.resolve(dirname, '../src/index.ts'),
    output: [
      {
        file: `dist/index.d.ts`,
        format: 'umd',
        // sourcemap: false,
      },
      {
        file: `lib/index.d.ts`,
        format: 'cjs',
        // sourcemap: false,
      },
      {
        file: `es/index.d.ts`,
        format: 'es',
        // sourcemap: false,
      },
    ],
    plugins: [dts({ respectExternal: true })],
  },
];

files.forEach((file) => {
  const filename = path.basename(file).replace(/\.\w+$/, '');
  if (filename === 'index') return;

  configList.unshift(
    generateConfig(
      path.resolve(file),
      [
        {
          file: `${path.resolve('.', filename, 'index')}.umd.js`,
          format: 'umd',
          name: pkgName,
          banner,
        },
        {
          file: `${path.resolve('.', filename, 'index')}.umd.min.js`,
          format: 'umd',
          name: pkgName,
          banner,
          plugins: [terser()],
        },
        {
          file: `${path.resolve('.', filename, 'index')}.cjs.js`,
          format: 'cjs',
          name: pkgName,
          banner,
          plugins: [terser()],
        },
        {
          file: `${path.resolve('.', filename, 'index')}.esm.js`,
          format: 'es',
          name: pkgName,
          banner,
          plugins: [terser()],
        },
        {
          file: `${path.resolve('.', filename, 'index')}.js`,
          format: 'iife',
          name: pkgName,
          banner,
          plugins: [terser()],
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
