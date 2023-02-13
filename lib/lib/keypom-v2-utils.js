"use strict";
// helpers for keypom account contract args
var RECEIVER_HEADER = '|kR|';
var ACTION_HEADER = '|kA|';
var PARAM_START = '|kP|';
var PARAM_STOP = '|kS|';
var wrapParams = function (params, newParams) {
    if (newParams === void 0) { newParams = {}; }
    console.log('wrap params params: ', params);
    Object.entries(params).forEach(function (_a) {
        var k = _a[0], v = _a[1];
        console.log('[k, v]: ', [k, v]);
        if (k === 'args' && typeof v !== 'string') {
            v = JSON.stringify(v);
        }
        if (Array.isArray(v))
            v = v.join();
        newParams[PARAM_START + k] = v + PARAM_STOP;
    });
    return newParams;
};
var genArgs = function (json) {
    console.log('json: ', json);
    var newJson = {
        transactions: []
    };
    json.transactions.forEach(function (tx) {
        console.log('tx: ', tx);
        var newTx = {};
        newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId;
        newTx.actions = [];
        console.log('newTx: ', newTx);
        tx.actions.forEach(function (action) {
            console.log('action: ', action);
            var newAction = {};
            newAction[ACTION_HEADER] = action.type;
            console.log('newAction after type: ', newAction);
            // newAction.params = action.params
            newAction.params = wrapParams(action.params);
            console.log('newAction after params ', newAction);
            newTx.actions.push(newAction);
        });
        console.log('newTx (END): ', newTx);
        newJson.transactions.push(newTx);
    });
    return newJson;
};
module.exports = {
    genArgs: genArgs,
    wrapParams: wrapParams
};
