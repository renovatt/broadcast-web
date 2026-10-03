import { describe, expect, it } from 'vitest';
import type { TrackingData } from '@react-input/mask';
import { PHONE_MASK } from '../utils/phone-mask';

const typing = (value: string, data: string): TrackingData => ({
  inputType: 'insert',
  data,
  value,
  selectionStart: value.length,
  selectionEnd: value.length,
});

describe('PHONE_MASK', () => {
  it('aceita apenas dígitos', () => {
    expect(PHONE_MASK.replacement).toEqual({ _: /\d/ });
  });

  it('usa a máscara de fixo até 10 dígitos', () => {
    expect(PHONE_MASK.modify?.(typing('(11) 3333-444', '4'))).toEqual({ mask: '(__) ____-____' });
  });

  it('troca para a máscara de celular no 11º dígito', () => {
    expect(PHONE_MASK.modify?.(typing('(11) 9999-8888', '8'))).toEqual({
      mask: '(__) _____-____',
    });
  });

  it('volta para fixo ao apagar dígitos', () => {
    const deleting: TrackingData = {
      inputType: 'deleteBackward',
      data: null,
      value: '(11) 99999-8888',
      selectionStart: 14,
      selectionEnd: 15,
    };
    expect(PHONE_MASK.modify?.(deleting)).toEqual({ mask: '(__) ____-____' });
  });
});
