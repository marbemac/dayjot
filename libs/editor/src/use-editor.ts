/**
 * Custom implementation of https://github.com/ueberdosis/tiptap/blob/develop/packages/react/src/useEditor.ts
 * that allows for more control over the editor instance.
 *
 * In particular, we want to manage the editor lifecycle ourselves, so that we can preserve undo/redo stack
 * as virtualized entries come in and out of the dom.
 */

import type { EditorOptions } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import type { DependencyList } from 'react';
import { useEffect, useRef, useState } from 'react';

function useForceUpdate() {
  const [, setValue] = useState(0);

  return () => setValue(value => value + 1);
}

export const useTipTapEditor = (
  options: Partial<EditorOptions> = {},
  deps: DependencyList = [],
  externalEditor?: Editor,
) => {
  const [editor, setEditor] = useState<Editor | null>(externalEditor || null);

  const forceUpdate = useForceUpdate();

  const { onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate } = options;

  const onBeforeCreateRef = useRef(onBeforeCreate);
  const onBlurRef = useRef(onBlur);
  const onCreateRef = useRef(onCreate);
  const onDestroyRef = useRef(onDestroy);
  const onFocusRef = useRef(onFocus);
  const onSelectionUpdateRef = useRef(onSelectionUpdate);
  const onTransactionRef = useRef(onTransaction);
  const onUpdateRef = useRef(onUpdate);

  // This effect will handle updating the editor instance
  // when the event handlers change.
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (onBeforeCreate) {
      editor.off('beforeCreate', onBeforeCreateRef.current);
      editor.on('beforeCreate', onBeforeCreate);
      onBeforeCreateRef.current = onBeforeCreate;
    }

    if (onBlur) {
      editor.off('blur', onBlurRef.current);
      editor.on('blur', onBlur);
      onBlurRef.current = onBlur;
    }

    if (onCreate) {
      editor.off('create', onCreateRef.current);
      editor.on('create', onCreate);
      onCreateRef.current = onCreate;
    }

    if (onDestroy) {
      editor.off('destroy', onDestroyRef.current);
      editor.on('destroy', onDestroy);
      onDestroyRef.current = onDestroy;
    }

    if (onFocus) {
      editor.off('focus', onFocusRef.current);
      editor.on('focus', onFocus);
      onFocusRef.current = onFocus;
    }

    if (onSelectionUpdate) {
      editor.off('selectionUpdate', onSelectionUpdateRef.current);
      editor.on('selectionUpdate', onSelectionUpdate);
      onSelectionUpdateRef.current = onSelectionUpdate;
    }

    if (onTransaction) {
      editor.off('transaction', onTransactionRef.current);
      editor.on('transaction', onTransaction);
      onTransactionRef.current = onTransaction;
    }

    if (onUpdate) {
      editor.off('update', onUpdateRef.current);
      editor.on('update', onUpdate);
      onUpdateRef.current = onUpdate;
    }

    return () => {
      if (onBeforeCreateRef.current) editor.off('beforeCreate', onBeforeCreateRef.current);
      if (onBlurRef.current) editor.off('blur', onBlurRef.current);
      if (onCreateRef.current) editor.off('create', onCreateRef.current);
      if (onDestroyRef.current) editor.off('destroy', onDestroyRef.current);
      if (onFocusRef.current) editor.off('focus', onFocusRef.current);
      if (onSelectionUpdateRef.current) editor.off('selectionUpdate', onSelectionUpdateRef.current);
      if (onTransactionRef.current) editor.off('transaction', onTransactionRef.current);
      if (onUpdateRef.current) editor.off('update', onUpdateRef.current);
    };
  }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, editor]);

  useEffect(() => {
    let isMounted = true;

    const instance = externalEditor || new Editor(options);

    setEditor(instance);

    const onChange = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted) {
            forceUpdate();
          }
        });
      });
    };

    instance.on('transaction', onChange);

    return () => {
      isMounted = false;
      instance.off('transaction', onChange);
    };
  }, [...deps, externalEditor || null]);

  useEffect(() => {
    return () => {
      // If this hook is managing the editor, destroy it when the component unmounts.
      if (!externalEditor) {
        editor?.destroy();
      }
    };
  }, [editor, externalEditor || null]);

  return editor;
};
