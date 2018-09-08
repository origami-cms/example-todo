import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'src/todo-app.js',
    dest: 'public/todo-app.min.js',
    format: 'iife',

    plugins: [resolve(), commonjs()]
};
