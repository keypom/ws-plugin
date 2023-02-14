"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeypomModal = void 0;
var React = __importStar(require("react"));
var Button_1 = __importDefault(require("@mui/material/Button"));
var TextField_1 = __importDefault(require("@mui/material/TextField"));
var Dialog_1 = __importDefault(require("@mui/material/Dialog"));
var DialogActions_1 = __importDefault(require("@mui/material/DialogActions"));
var DialogContent_1 = __importDefault(require("@mui/material/DialogContent"));
var DialogContentText_1 = __importDefault(require("@mui/material/DialogContentText"));
var DialogTitle_1 = __importDefault(require("@mui/material/DialogTitle"));
var KeypomModal = function (_a) {
    //const [enteredAccountId, setEnteredAccountId] = React.useState<string>();
    var options = _a.options, visible = _a.visible, hide = _a.hide, onSubmit = _a.onSubmit;
    var onChange = function (e) {
        console.log('e: ', e);
        //setEnteredAccountId(e.target.value)
    };
    return (React.createElement("div", null,
        React.createElement(Dialog_1.default, { open: visible, onClose: function () { hide(); } },
            React.createElement(DialogTitle_1.default, null, options.title),
            React.createElement(DialogContent_1.default, null,
                React.createElement(DialogContentText_1.default, null, options.description),
                React.createElement(TextField_1.default, { autoFocus: true, margin: "dense", id: "name", label: "Account ID", type: "email", fullWidth: true, variant: "standard", onChange: onChange })),
            React.createElement(DialogActions_1.default, null,
                React.createElement(Button_1.default, { onClick: function () { onSubmit("enteredAccountId"); } }, "Enter")))));
};
exports.KeypomModal = KeypomModal;
