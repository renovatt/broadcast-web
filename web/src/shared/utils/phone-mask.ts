import type { MaskOptions, TrackingData } from '@react-input/mask';

const LANDLINE_MASK = '(__) ____-____';
const MOBILE_MASK = '(__) _____-____';

/** Quantos dígitos o campo terá depois da edição em andamento. */
const digitsAfterInput = ({ value, data, selectionStart, selectionEnd }: TrackingData) =>
  `${value.slice(0, selectionStart)}${data ?? ''}${value.slice(selectionEnd)}`.replace(/\D/g, '')
    .length;

/**
 * Máscara de telefone brasileiro com DDD: fixo "(11) 3333-4444" até 10 dígitos,
 * celular "(11) 99999-8888" a partir do 11º dígito.
 */
export const PHONE_MASK: MaskOptions = {
  mask: MOBILE_MASK,
  replacement: { _: /\d/ },
  modify: (input) => ({ mask: digitsAfterInput(input) > 10 ? MOBILE_MASK : LANDLINE_MASK }),
};
