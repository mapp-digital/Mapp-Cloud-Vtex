interface Window extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _ti: any
  wts: any
}

interface MappSettings {
  tiId: string
  tiResponder: string
  acId: string
  acM: string
}

type MappSettingProperty = 'tiId' | 'tiResponder' | 'acId' | 'acM'

type MappSetting = {
  [key: MappSettingProperty]: string
}

interface MappSettingsProvider {
  config: MappSettings
  saveSettings: () => void
  setConfig: Dispatch<SetStateAction<MappSettings>>
  updateConfig: (MappSetting: MappSetting) => void
  configLoading: boolean
  isSaving: boolean
}

declare module '*.gql' {
  import type { DocumentNode } from 'graphql'

  const value: DocumentNode
  export = value
}
