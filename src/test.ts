import promisesAplusTests from 'promises-aplus-tests'
import Promise from './promise'

promisesAplusTests(Promise, (err) => {
	console.log(err)
})
