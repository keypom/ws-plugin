"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyForm = void 0;
var react_1 = require("react");
var react_2 = __importDefault(require("react"));
function MyForm() {
    var _a = (0, react_1.useState)(""), name = _a[0], setName = _a[1];
    var handleSubmit = function (event) {
        event.preventDefault();
        alert("The name you entered was: ".concat(name));
    };
    console.log("I AM IN THE FORM");
    return (react_2.default.createElement("form", { onSubmit: handleSubmit },
        react_2.default.createElement("label", null,
            "Enter your name:",
            react_2.default.createElement("input", { type: "text", value: name, onChange: function (e) { return setName(e.target.value); } })),
        react_2.default.createElement("input", { type: "submit" })));
}
exports.MyForm = MyForm;
