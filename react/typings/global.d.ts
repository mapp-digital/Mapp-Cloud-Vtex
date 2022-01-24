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

interface MappSettingsProvider {
  config: MappSettings;
  saveSettings: () => void;
  setConfig: Dispatch<SetStateAction<MappSettings>>;
  configLoading: boolean;
  isSaving: boolean;
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql';

  const value: DocumentNode;
  export = value;
}