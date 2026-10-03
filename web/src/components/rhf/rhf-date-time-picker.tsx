import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

type RhfDateTimePickerProps<T extends FieldValues> = Omit<
  DateTimePickerProps,
  'name' | 'value' | 'onChange' | 'inputRef'
> & {
  name: Path<T>;
  control: Control<T>;
  helperText?: string;
};

/** DateTimePicker do MUI X (dayjs) ligado ao react-hook-form, exibindo o erro de validação. */
export const RhfDateTimePicker = <T extends FieldValues>({
  name,
  control,
  helperText,
  slotProps,
  ...props
}: RhfDateTimePickerProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <DateTimePicker
      ampm={false}
      {...props}
      value={field.value ?? null}
      onChange={field.onChange}
      inputRef={field.ref}
      slotProps={{
        ...slotProps,
        textField: {
          fullWidth: true,
          name: field.name,
          onBlur: field.onBlur,
          error: Boolean(error),
          helperText: error?.message ?? helperText,
        },
      }}
    />
  );
};
