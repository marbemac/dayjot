import { Box, VStack } from '@supastack/ui-primitives';

import type { ResultRowProps } from '~/state/tinybase.tsx';
import { ResultCellView, ResultTableView, tinyQueries } from '~/state/tinybase.tsx';

export const Calendar = () => {
  return (
    <>
      <Box>Dirty Entries:</Box>
      <VStack>
        <ResultTableView queries={tinyQueries} queryId="dirtyEntries" resultRowComponent={MyResultRowView} />
      </VStack>
    </>
  );
};

const MyResultRowView = (props: ResultRowProps) => {
  console.log('MyResultRowView.render', props);

  return (
    <Box>
      <ResultCellView {...props} cellId="day" />
    </Box>
  );
};
