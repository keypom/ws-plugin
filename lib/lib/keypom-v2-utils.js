"use strict";
// helpers for keypom account contract args
var RECEIVER_HEADER = '|kR|';
var ACTION_HEADER = '|kA|';
var PARAM_START = '|kP|';
var PARAM_STOP = '|kS|';
var wrapParams = function (params, newParams) {
    if (newParams === void 0) { newParams = {}; }
    Object.entries(params).forEach(function (_a) {
        var k = _a[0], v = _a[1];
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
        var newTx = {};
        newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId;
        newTx.actions = [];
        tx.actions.forEach(function (action) {
            var newAction = {};
            newAction[ACTION_HEADER] = action.type;
            newAction.params = wrapParams(action.params);
            newTx.actions.push(newAction);
        });
        newJson.transactions.push(newTx);
    });
    return newJson;
};
module.exports = {
    genArgs: genArgs,
    wrapParams: wrapParams
};
