export const getEditorRoot = () =>
  window.frames['VisualEditorEditModeIFrame'].contentDocument.getElementById(
    'VisualEditorEditModeRoot',
  );
