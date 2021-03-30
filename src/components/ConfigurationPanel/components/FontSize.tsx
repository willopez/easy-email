import React, { useMemo } from 'react';
import { useBlock } from '@/hooks/useBlock';
import { TextField } from '@/components/core/Form';
import { getOptionsByStringArray } from '@/utils/getOptionsByStringArray';

const options = getOptionsByStringArray(['normal', 'italic']);

export function FontSize() {
  const { focusIdx } = useBlock();

  return useMemo(() => {
    return (
      <TextField
        label='Font-size'
        quickchange
        name={`${focusIdx}.attribute.font-size`}
        inline
      />
    );
  }, [focusIdx]);
}