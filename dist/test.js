"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_aplus_tests_1 = __importDefault(require("promises-aplus-tests"));
var promise_1 = __importDefault(require("./promise"));
promises_aplus_tests_1.default(promise_1.default, function (err) {
    console.log(err);
});
//# sourceMappingURL=test.js.map