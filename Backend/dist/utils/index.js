"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.catchAsync = void 0;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
exports.parse = parse;
//# sourceMappingURL=index.js.map