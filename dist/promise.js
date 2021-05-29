"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var microTask_1 = __importDefault(require("./microTask"));
var Status = {
    Pending: Symbol('Pending'),
    Fulfilled: Symbol('Fulfilled'),
    Rejected: Symbol('Rejected'),
};
Object.freeze(Status);
var Promise = /** @class */ (function () {
    function Promise(cb) {
        this.id = Promise._id++;
        this.state = Status.Pending;
        this.tasks = [];
        try {
            cb(this.resolve.bind(this), this.reject.bind(this));
        }
        catch (error) {
            this.reject(error);
        }
    }
    Promise.resolved = function (value) {
        return new Promise(function (resolve, _) {
            resolve(value);
        });
    };
    Promise.rejected = function (reason) {
        return new Promise(function (_, reject) {
            reject(reason);
        });
    };
    Promise.deferred = function () {
        var resolve, reject;
        var promise = new Promise(function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;
        });
        return { promise: promise, resolve: resolve, reject: reject };
    };
    Promise.prototype.resolve = function (value) {
        if (this.state === Status.Pending) {
            this.state = Status.Fulfilled;
            this.value = value;
            this.tasks.forEach(function (cb) {
                cb(value);
            });
        }
    };
    Promise.prototype.reject = function (reason) {
        if (this.state === Status.Pending) {
            this.state = Status.Rejected;
            this.reason = reason;
            this.tasks.forEach(function (cb) {
                cb(reason);
            });
        }
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var promise = Promise.deferred();
        var task = this.createTask(promise, onFulfilled, onRejected);
        if (this.state === Status.Pending) {
            this.tasks.push(task);
        }
        else {
            task();
        }
        return promise.promise;
    };
    Promise.prototype.createTask = function (promise, onFulfilled, onRejected) {
        var _this = this;
        //wrap callback in task
        var _task = function () {
            var thenCb;
            var thenFb;
            var param;
            switch (_this.state) {
                case Status.Fulfilled:
                    thenCb = onFulfilled;
                    thenFb = promise.resolve;
                    param = _this.value;
                    break;
                case Status.Rejected:
                    thenCb = onRejected;
                    thenFb = promise.reject;
                    param = _this.reason;
                    break;
            }
            if (typeof thenCb !== 'function') {
                thenFb(param);
                return;
            }
            try {
                var x = thenCb(param);
                _this.Resolve(promise, x);
            }
            catch (error) {
                promise.reject(error);
                return;
            }
        };
        return function task() {
            //onFulfilled or onRejected must not be called until the execution context stack contains only platform code
            Promise.microTask.nextTick(_task);
        };
    };
    Promise.prototype.Resolve = function (promise, x) {
        var _this = this;
        //promise
        if (x instanceof Promise) {
            if (x === promise.promise) {
                promise.reject(new TypeError());
            }
            else {
                x.then(function (y) {
                    _this.Resolve(promise, y);
                }, function (r) {
                    promise.reject(r);
                });
            }
            return;
        }
        //thenable
        if (x && (typeof x === 'object' || typeof x === 'function')) {
            var then = void 0;
            try {
                then = x.then;
            }
            catch (error) {
                promise.reject(error);
                return;
            }
            if (typeof then === 'function') {
                var called_1 = false;
                try {
                    then.bind(x)(function (y) {
                        if (called_1)
                            return;
                        called_1 = true;
                        _this.Resolve(promise, y);
                    }, function (r) {
                        if (called_1)
                            return;
                        called_1 = true;
                        promise.reject(r);
                    });
                }
                catch (error) {
                    if (!called_1) {
                        promise.reject(error);
                    }
                }
                return;
            }
        }
        //other
        promise.resolve(x);
    };
    Promise.microTask = new microTask_1.default();
    Promise._id = 0;
    return Promise;
}());
exports.default = Promise;
//# sourceMappingURL=promise.js.map