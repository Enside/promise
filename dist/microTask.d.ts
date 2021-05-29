declare class MicroTask {
    private isBrowser;
    private target;
    private count;
    private taskId;
    private taskMap;
    constructor();
    nextTick(cb: () => void): string;
    trigger(taskId: string): void;
}
export default MicroTask;
