import { RichTextEditor } from '@dayjot/editor';
import { Card } from '@supastack/ui-primitives';

export const QuickAdd = () => {
  return (
    <Card size="sm">
      <RichTextEditor id="quick-add" size="sm" placeholder="Quick add to today..." />
    </Card>
  );
};
