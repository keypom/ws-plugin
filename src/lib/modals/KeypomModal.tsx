import * as React from 'react';
import { ModalOptions } from './modal';

const css = `
.modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
}

.modal.enter-done {
  opacity: 1;
  pointer-events: visible;
}

.modal.exit {
  opacity: 0;
}

.modal-content {
  width: 500px;
  background-color: #fff;
  transition: all 0.3s ease-in-out;
  transform: translateY(-200px);
}

.modal.enter-done .modal-content {
  transform: translateY(0);
}

.modal.exit .modal-content {
  transform: translateY(-200px);
}

.modal-header,
.modal-footer {
  padding: 10px;
}

.modal-title {
  margin: 0;
}

.modal-body {
  padding: 10px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}`

interface ModalProps {
  options: ModalOptions;
  visible: boolean;
  hide: () => void;
  onSubmit: (e) => void;
}

export const KeypomModal: React.FC<ModalProps> = ({
  options,
  visible,
  hide,
  onSubmit
}) => {
  //const [enteredAccountId, setEnteredAccountId] = React.useState<string>();

  const onChange = (e) => {
    console.log('e: ', e)
    //setEnteredAccountId(e.target.value)
  }

  return (
      <div className="css.modal" onClick={hide}>
        <div className="css.modal-content" onClick={e => e.stopPropagation()}>
          <div className="css.modal-header">
            <h4 className="css.modal-title">{options.title}</h4>
          </div>
          <div className="css.modal-body">{options.description}</div>
          <div className="css.modal-footer">
            <button onClick={onSubmit} className="button">
              Submit
            </button>
          </div>
        </div>
      </div>
  );
}