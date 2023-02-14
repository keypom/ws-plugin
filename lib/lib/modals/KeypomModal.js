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
var react_1 = __importStar(require("react"));
var getThemeClass = function (theme) {
    switch (theme) {
        case "dark":
            return "dark-theme";
        case "light":
            return "light-theme";
        default:
            return "";
    }
};
var KeypomModal = function (_a) {
    var title = _a.title, description = _a.description, options = _a.options, visible = _a.visible, hide = _a.hide;
    var _b = (0, react_1.useState)(null), alertMessage = _b[0], setAlertMessage = _b[1];
    var handleDismissClick = (0, react_1.useCallback)(function (_a) {
        var hideReason = _a.hideReason;
        setAlertMessage(null);
        hide();
    }, [hide]);
    (0, react_1.useEffect)(function () {
        var close = function (e) {
            if (e.key === "Escape") {
                handleDismissClick({ hideReason: "user-triggered" });
            }
        };
        window.addEventListener("keydown", close);
        return function () { return window.removeEventListener("keydown", close); };
    }, [handleDismissClick]);
    // const handleWalletClick = async (
    //   module: ModuleState,
    //   qrCodeModal: boolean
    // ) => {
    //   setSelectedWallet(module);
    //   const { selectedWalletId } = selector.store.getState();
    //   if (selectedWalletId === module.id) {
    //     setRoute({
    //       name: "WalletConnected",
    //       params: {
    //         module,
    //       },
    //     });
    //     return;
    //   }
    //   try {
    //     const { deprecated, available } = module.metadata;
    //     if (module.type === "injected" && !available) {
    //       setRoute({
    //         name: "WalletNotInstalled",
    //         params: { module: module },
    //       });
    //       return;
    //     }
    //     const wallet = await module.wallet();
    //     if (deprecated) {
    //       setAlertMessage(
    //         `${module.metadata.name} is deprecated. Please select another wallet.`
    //       );
    //       setRoute({
    //         name: "AlertMessage",
    //         params: {
    //           module: module,
    //         },
    //       });
    //       return;
    //     }
    //     if (wallet.type === "hardware") {
    //       setRoute({
    //         name: "DerivationPath",
    //         params: {
    //           walletId: wallet.id || "ledger",
    //         },
    //       });
    //       return;
    //     }
    //     setRoute({
    //       name: "WalletConnecting",
    //       params: { wallet: wallet },
    //     });
    //     if (wallet.type === "bridge") {
    //       const subscription = selector.on("uriChanged", ({ uri }) => {
    //         setBridgeWalletUri(uri);
    //         setRoute({
    //           name: "ScanQRCode",
    //           params: {
    //             uri,
    //             wallet,
    //           },
    //         });
    //       });
    //       await wallet.signIn({
    //         contractId: options.contractId,
    //         methodNames: options.methodNames,
    //         qrCodeModal,
    //       });
    //       subscription.remove();
    //       handleDismissClick({ hideReason: "wallet-navigation" });
    //       return;
    //     }
    //     if (wallet.type === "browser") {
    //       await wallet.signIn({
    //         contractId: options.contractId,
    //         methodNames: options.methodNames,
    //         successUrl: wallet.metadata.successUrl,
    //         failureUrl: wallet.metadata.failureUrl,
    //       });
    //       handleDismissClick({ hideReason: "wallet-navigation" });
    //       return;
    //     }
    //     await wallet.signIn({
    //       contractId: options.contractId,
    //       methodNames: options.methodNames,
    //     });
    //     handleDismissClick({ hideReason: "wallet-navigation" });
    //   } catch (err) {
    //     const { name } = module.metadata;
    //     const message =
    //       err instanceof Error ? err.message : "Something went wrong";
    //     setAlertMessage(`Failed to sign in with ${name}: ${message}`);
    //     setRoute({
    //       name: "AlertMessage",
    //       params: {
    //         module: module,
    //       },
    //     });
    //   }
    // };
    if (!visible) {
        return null;
    }
    return (react_1.default.createElement("div", { className: "nws-modal-wrapper ".concat(getThemeClass(options === null || options === void 0 ? void 0 : options.theme), " ").concat(visible ? "open" : "") },
        react_1.default.createElement("div", { className: "nws-modal-overlay", onClick: function () {
                handleDismissClick({ hideReason: "user-triggered" });
            } }),
        react_1.default.createElement("div", { className: "nws-modal" },
            react_1.default.createElement("div", { className: "modal-left" },
                react_1.default.createElement("div", { className: "modal-left-title" },
                    react_1.default.createElement("h2", null, title))),
            react_1.default.createElement("div", { className: "modal-right" },
                react_1.default.createElement("div", { className: "nws-modal-body" },
                    react_1.default.createElement("h2", null, description))))));
};
exports.KeypomModal = KeypomModal;
