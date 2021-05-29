import MicroTask from './microTask'

type deferredPromise = {
	promise: Promise
	resolve: (value: any) => void
	reject: (reason: any) => void
}

const Status = {
	Pending: Symbol('Pending'),
	Fulfilled: Symbol('Fulfilled'),
	Rejected: Symbol('Rejected'),
}

Object.freeze(Status)

class Promise {
	private static microTask = new MicroTask()
	private static _id: number = 0
	private id: number = Promise._id++
	private state: symbol = Status.Pending
	private value: any
	private reason: any
	private tasks: Array<Function> = []

	constructor(
		cb: (
			resolve?: (value?: any) => void,
			reject?: (reason?: any) => void
		) => void
	) {
		try {
			cb(this.resolve.bind(this), this.reject.bind(this))
		} catch (error) {
			this.reject(error)
		}
	}

	static resolved(value: any): Promise {
		return new Promise((resolve, _) => {
			resolve(value)
		})
	}

	static rejected(reason: any): Promise {
		return new Promise((_, reject) => {
			reject(reason)
		})
	}

	static deferred(): deferredPromise {
		let resolve, reject
		const promise = new Promise((_resolve, _reject) => {
			resolve = _resolve
			reject = _reject
		})
		return { promise, resolve, reject }
	}

	private resolve(value: any) {
		if (this.state === Status.Pending) {
			this.state = Status.Fulfilled
			this.value = value
			this.tasks.forEach((cb) => {
				cb(value)
			})
		}
	}

	private reject(reason: any) {
		if (this.state === Status.Pending) {
			this.state = Status.Rejected
			this.reason = reason
			this.tasks.forEach((cb) => {
				cb(reason)
			})
		}
	}

	then(onFulfilled?: (value?: any) => any, onRejected?: (reason?: any) => any) {
		const promise = Promise.deferred()
		const task = this.createTask(promise, onFulfilled, onRejected)
		if (this.state === Status.Pending) {
			this.tasks.push(task)
		} else {
			task()
		}
		return promise.promise
	}

	private createTask(
		promise: deferredPromise,
		onFulfilled?: (value?: any) => any,
		onRejected?: (reason?: any) => any
	): () => void {
		//wrap callback in task
		const _task = () => {
			let thenCb
			let thenFb
			let param
			switch (this.state) {
				case Status.Fulfilled:
					thenCb = onFulfilled
					thenFb = promise.resolve
					param = this.value
					break
				case Status.Rejected:
					thenCb = onRejected
					thenFb = promise.reject
					param = this.reason
					break
			}
			if (typeof thenCb !== 'function') {
				thenFb(param)
				return
			}
			try {
				const x = thenCb(param)
				this.Resolve(promise, x)
			} catch (error) {
				promise.reject(error)
				return
			}
		}
		return function task() {
			//onFulfilled or onRejected must not be called until the execution context stack contains only platform code
			Promise.microTask.nextTick(_task)
		}
	}

	private Resolve(promise: deferredPromise, x: any) {
		//promise
		if (x instanceof Promise) {
			if (x === promise.promise) {
				promise.reject(new TypeError())
			} else {
				x.then(
					(y) => {
						this.Resolve(promise, y)
					},
					(r) => {
						promise.reject(r)
					}
				)
			}
			return
		}
		//thenable
		if (x && (typeof x === 'object' || typeof x === 'function')) {
			let then
			try {
				then = x.then
			} catch (error) {
				promise.reject(error)
				return
			}
			if (typeof then === 'function') {
				let called = false
				try {
					then.bind(x)(
						(y) => {
							if (called) return
							called = true
							this.Resolve(promise, y)
						},
						(r) => {
							if (called) return
							called = true
							promise.reject(r)
						}
					)
				} catch (error) {
					if (!called) {
						promise.reject(error)
					}
				}
				return
			}
		}
		//other
		promise.resolve(x)
	}
}

export default Promise
