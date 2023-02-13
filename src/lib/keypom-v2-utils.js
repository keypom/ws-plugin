// helpers for keypom account contract args
const RECEIVER_HEADER = '|kR|'
const ACTION_HEADER = '|kA|'
const PARAM_START = '|kP|'
const PARAM_STOP = '|kS|'

const wrapParams = (params, newParams = {}) => {
	console.log('wrap params params: ', params)
	Object.entries(params).forEach(([k, v]) => {
		console.log('[k, v]: ', [k, v])
		if (k === 'args' && typeof v !== 'string') {
			v = JSON.stringify(v)
		}
		if (Array.isArray(v)) v = v.join()
		newParams[PARAM_START+k] = v + PARAM_STOP
	})
	return newParams
}

const genArgs = (json) => {
	console.log('json: ', json)
	const newJson = {
		transactions: []
	}

	json.transactions.forEach((tx) => {
		console.log('tx: ', tx)
		const newTx = {}
		newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId
		newTx.actions = []
		console.log('newTx: ', newTx)

		tx.actions.forEach((action) => {
			console.log('action: ', action)
			const newAction = {}
			newAction[ACTION_HEADER] = action.type
			console.log('newAction after type: ', newAction)
			// newAction.params = action.params
			newAction.params = wrapParams(action.params)
			console.log('newAction after params ', newAction)
			newTx.actions.push(newAction)
		})
		console.log('newTx (END): ', newTx)
		newJson.transactions.push(newTx)
	})
	return newJson
}

module.exports = {
	genArgs, wrapParams
}