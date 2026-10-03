import { useCallback, useRef, type RefCallback } from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useMask, type MaskOptions } from '@react-input/mask';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

export type RhfTextFieldProps<T extends FieldValues> = Omit<TextFieldProps, 'name'> & {
  name: Path<T>;
  control: Control<T>;
  /** Máscara opcional (@react-input/mask), ex.: telefone. O valor enviado ao form é o texto mascarado. */
  mask?: MaskOptions;
};

type FieldTextFieldProps = Omit<TextFieldProps, 'inputRef'> & {
  inputRef: RefCallback<HTMLInputElement>;
};

/** Campo com máscara: o ref do useMask e o do react-hook-form apontam para o mesmo <input>. */
const MaskedTextField = ({
  mask,
  inputRef,
  ...props
}: FieldTextFieldProps & { mask: MaskOptions }) => {
  const maskRef = useMask(mask);
  const elementRef = useRef<HTMLInputElement | null>(null);
  // Ref estável: um callback novo a cada render faria o React desanexar/reanexar o <input>
  // a cada tecla, e a máscara perderia o estado (dígitos sumindo durante a digitação).
  const setRefs = useCallback(
    (element: HTMLInputElement | null) => {
      // Ao desmontar: o @react-input mantém um loop de setTimeout enquanto o campo está focado
      // e só o encerra no "blur". Se o campo sai da tela ainda focado (ex.: Enter fecha o
      // diálogo), o navegador não dispara esse blur e o loop ficaria rodando para sempre.
      // Disparamos o blur antes de desconectar a máscara (que remove os listeners).
      if (!element) elementRef.current?.dispatchEvent(new FocusEvent('blur'));
      elementRef.current = element;
      maskRef.current = element as HTMLInputElement;
      inputRef(element);
    },
    [maskRef, inputRef],
  );
  return <TextField {...props} inputRef={setRefs} />;
};

/** TextField do MUI ligado ao react-hook-form, exibindo o erro de validação. */
export const RhfTextField = <T extends FieldValues>({
  name,
  control,
  helperText,
  mask,
  ...props
}: RhfTextFieldProps<T>) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name, control });

  const fieldProps: FieldTextFieldProps = {
    fullWidth: true,
    ...props,
    ...field,
    inputRef: ref,
    error: Boolean(error),
    helperText: error?.message ?? helperText,
  };

  return mask ? <MaskedTextField {...fieldProps} mask={mask} /> : <TextField {...fieldProps} />;
};
