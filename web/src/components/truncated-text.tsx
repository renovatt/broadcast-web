import { useState, type MouseEvent } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography, { type TypographyProps } from '@mui/material/Typography';

type TruncatedTextProps = Omit<TypographyProps, 'children'> & {
  text: string;
};

/**
 * Texto em uma linha com "…" quando não cabe. O texto completo aparece em um Tooltip,
 * apenas quando de fato foi cortado (medido ao passar o mouse).
 */
export const TruncatedText = ({
  text,
  className = '',
  onMouseEnter,
  ...props
}: TruncatedTextProps) => {
  const [isTruncated, setIsTruncated] = useState(false);

  const measure = (event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    setIsTruncated(element.scrollWidth > element.clientWidth);
    onMouseEnter?.(event as MouseEvent<HTMLSpanElement>);
  };

  return (
    <Tooltip title={isTruncated ? text : ''} placement="top-start" arrow>
      <Typography {...props} className={`truncate ${className}`} onMouseEnter={measure}>
        {text}
      </Typography>
    </Tooltip>
  );
};
