declare type deferredPromise = {
    promise: Promise;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
};
declare class Promise {
    private static microTask;
    private static _id;
    private id;
    private state;
    private value;
    private reason;
    private tasks;
    constructor(cb: (resolve?: (value?: any) => void, reject?: (reason?: any) => void) => void);
    static resolved(value: any): Promise;
    static rejected(reason: any): Promise;
    static deferred(): deferredPromise;
    private resolve;
    private reject;
    then(onFulfilled?: (value?: any) => any, onRejected?: (reason?: any) => any): Promise;
    private createTask;
    private Resolve;
}
export default Promise;
