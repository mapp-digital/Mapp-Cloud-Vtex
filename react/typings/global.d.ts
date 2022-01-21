interface Window extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _ti: any;
  wts: any;
}

interface MappSettings {
  tiId: string;
  tiResponder: string;
  acId: string;
  acM: string;
}

interface MappSettingsProvider extends MappSettings {
  saveSettings: (settings: MappSettings) => void;
  configLoading: boolean;
  isSaving: boolean;
}
