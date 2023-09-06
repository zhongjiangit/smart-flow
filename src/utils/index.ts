export const add = (...args) => args.reduce((a, b) => a + b, 0);
export const sub = (...args) => args.reduce((a, b) => a - b, args[0] * 2 || 0);
