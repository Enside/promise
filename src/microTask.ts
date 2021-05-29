class MicroTask {
	private isBrowser: boolean
	private target: HTMLDivElement
	private count: number = 0
	private taskId: string
	private taskMap: object = {}

	constructor() {
		Object.defineProperty(this, 'taskId', {
			get() {
				const taskId = 'task-' + this.count
				this.count++
				return taskId
			},
		})
		if (typeof window !== 'undefined') {
			this.isBrowser = true
			this.target = document.createElement('div')
		}
	}

	nextTick(cb: () => void): string {
		const taskId = this.taskId
		if (this.isBrowser) {
			const observer = new MutationObserver(() => {
				cb()
			})
			observer.observe(this.target, { attributeFilter: [taskId] })
			this.target.setAttribute(taskId, '')
		} else {
			this.taskMap[taskId] = cb
			process.nextTick(cb)
		}
		return taskId
	}

	trigger(taskId: string) {
		if (this.isBrowser) {
			this.target.setAttribute(taskId, '')
		} else {
			process.nextTick(this.taskMap[taskId])
		}
	}
}

export default MicroTask
