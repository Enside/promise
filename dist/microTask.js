"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MicroTask = /** @class */ (function () {
    function MicroTask() {
        this.count = 0;
        this.taskMap = {};
        Object.defineProperty(this, 'taskId', {
            get: function () {
                var taskId = 'task-' + this.count;
                this.count++;
                return taskId;
            },
        });
        if (typeof window !== 'undefined') {
            this.isBrowser = true;
            this.target = document.createElement('div');
        }
    }
    MicroTask.prototype.nextTick = function (cb) {
        var taskId = this.taskId;
        if (this.isBrowser) {
            var observer = new MutationObserver(function () {
                cb();
            });
            observer.observe(this.target, { attributeFilter: [taskId] });
            this.target.setAttribute(taskId, '');
        }
        else {
            this.taskMap[taskId] = cb;
            process.nextTick(cb);
        }
        return taskId;
    };
    MicroTask.prototype.trigger = function (taskId) {
        if (this.isBrowser) {
            this.target.setAttribute(taskId, '');
        }
        else {
            process.nextTick(this.taskMap[taskId]);
        }
    };
    return MicroTask;
}());
exports.default = MicroTask;
//# sourceMappingURL=microTask.js.map