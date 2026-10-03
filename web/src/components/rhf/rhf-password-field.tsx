import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { FieldValues } from 'react-hook-form';
import { RhfTextField, type RhfTextFieldProps } from './rhf-text-field';

type RhfPasswordFieldProps<T extends FieldValues> = Omit<
  RhfTextFieldProps<T>,
  'type' | 'slotProps'
> & {
  autoComplete: 'current-password' | 'new-password';
};

/** Campo de senha com botão para mostrar/ocultar o valor. */
export const RhfPasswordField = <T extends FieldValues>(props: RhfPasswordFieldProps<T>) => {
  const [visible, setVisible] = useState(false);

  return (
    <RhfTextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setVisible((current) => !current)}
              >
                {visible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
