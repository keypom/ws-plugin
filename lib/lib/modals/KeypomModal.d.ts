import React from "react";
import { ModalOptions } from "./modal";
interface ModalProps {
    title: string;
    description: string;
    options: ModalOptions;
    visible: boolean;
    hide: () => void;
}
export declare const KeypomModal: React.FC<ModalProps>;
export {};
