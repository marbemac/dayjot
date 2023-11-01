import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';

const focusOnEditorAtom = atom<string | null>(null);

export const useFocusOnEditor = () => {
  return useSetAtom(focusOnEditorAtom);
};

export const useFocusedEditor = () => {
  return useAtomValue(focusOnEditorAtom);
};

export const useIsEditorFocused = (docId: string) => {
  const focusedEditor = useAtomValue(focusOnEditorAtom);
  return useMemo(() => focusedEditor === docId, [focusedEditor, docId]);
};
