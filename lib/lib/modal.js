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
exports.Example = void 0;
var react_1 = __importStar(require("react"));
var Button_1 = __importDefault(require("react-bootstrap/Button"));
var Modal_1 = __importDefault(require("react-bootstrap/Modal"));
function Example() {
    var _a = (0, react_1.useState)(false), show = _a[0], setShow = _a[1];
    setShow(true);
    var handleClose = function () { return setShow(false); };
    var handleShow = function () { return setShow(true); };
    return (<>
      <Button_1.default variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button_1.default>

      <Modal_1.default show={show} onHide={handleClose}>
        <Modal_1.default.Header closeButton>
          <Modal_1.default.Title>Modal heading</Modal_1.default.Title>
        </Modal_1.default.Header>
        <Modal_1.default.Body>Woohoo, you're reading this text in a modal!</Modal_1.default.Body>
        <Modal_1.default.Footer>
          <Button_1.default variant="secondary" onClick={handleClose}>
            Close
          </Button_1.default>
          <Button_1.default variant="primary" onClick={handleClose}>
            Save Changes
          </Button_1.default>
        </Modal_1.default.Footer>
      </Modal_1.default>
    </>);
}
exports.Example = Example;
render(<Example />);
