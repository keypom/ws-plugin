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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeypomModal = void 0;
var React = __importStar(require("react"));
var css = "\n.modal {\n  position: fixed;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, 0.5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transition: all 0.3s ease-in-out;\n  pointer-events: none;\n}\n\n.modal.enter-done {\n  opacity: 1;\n  pointer-events: visible;\n}\n\n.modal.exit {\n  opacity: 0;\n}\n\n.modal-content {\n  width: 500px;\n  background-color: #fff;\n  transition: all 0.3s ease-in-out;\n  transform: translateY(-200px);\n}\n\n.modal.enter-done .modal-content {\n  transform: translateY(0);\n}\n\n.modal.exit .modal-content {\n  transform: translateY(-200px);\n}\n\n.modal-header,\n.modal-footer {\n  padding: 10px;\n}\n\n.modal-title {\n  margin: 0;\n}\n\n.modal-body {\n  padding: 10px;\n  border-top: 1px solid #eee;\n  border-bottom: 1px solid #eee;\n}";
var KeypomModal = function (_a) {
    //const [enteredAccountId, setEnteredAccountId] = React.useState<string>();
    var options = _a.options, visible = _a.visible, hide = _a.hide, onSubmit = _a.onSubmit;
    var onChange = function (e) {
        console.log('e: ', e);
        //setEnteredAccountId(e.target.value)
    };
    return (React.createElement("div", { className: "css.modal", onClick: hide },
        React.createElement("div", { className: "css.modal-content", onClick: function (e) { return e.stopPropagation(); } },
            React.createElement("div", { className: "css.modal-header" },
                React.createElement("h4", { className: "css.modal-title" }, options.title)),
            React.createElement("div", { className: "css.modal-body" }, options.description),
            React.createElement("div", { className: "css.modal-footer" },
                React.createElement("button", { onClick: onSubmit, className: "button" }, "Submit")))));
};
exports.KeypomModal = KeypomModal;
