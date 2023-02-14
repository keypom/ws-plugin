import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ModalOptions } from './modal';


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
    <div>
      <Dialog open={visible} onClose={() => {hide()}}>
        <DialogTitle>{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
          {options.description}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Account ID"
            type="email"
            fullWidth
            variant="standard"
            onChange={onChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {onSubmit("enteredAccountId")}}>Enter</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}