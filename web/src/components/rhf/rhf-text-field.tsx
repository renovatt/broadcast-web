import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

export type RhfTextFieldProps<T extends FieldValues> = Omit<TextFieldProps, 'name'> & {
  name: Path<T>;
  control: Control<T>;
};

/** TextField do MUI ligado ao react-hook-form, exibindo o erro de validação. */
export const RhfTextField = <T extends FieldValues>({
  name,
  control,
  helperText,
  ...props
}: RhfTextFieldProps<T>) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      fullWidth
      {...props}
      {...field}
      inputRef={ref}
      error={Boolean(error)}
      helperText={error?.message ?? helperText}
    />
  );
};
