import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo'

import settingsSchema from '../queries/settingsSchema.gql'
import saveMappSettings from '../queries/saveSettings.gql'

const defaultConfigValues = {
  tiId: '0',
  tiResponder: '0',
  acId: '0',
  acM: '0',
  engageApiUrl: '0',
  engageIntegrationId: '0',
  engageSecret: '0',
  customerGroupID: '0',
  subscribersGroupID: '0',
  newsletterDoubleOptIn: 'Off',
  messageOrderCreatedID: '0',
  messageOrderCanceledID: '0',
  messageOrderPaymentApprovedID: '0',
  messageOrderInvoicedID: '0',
}

const Config = React.createContext<MappSettingsProvider>({
  config: defaultConfigValues,
  saveSettings: () => {},
  configLoading: true,
  isSaving: false,
  setConfig: () => {},
  updateConfig: () => {},
})

export const ConfigProvider: React.FC = props => {
  const { data: dataSettingsSchema } = useQuery(settingsSchema)
  const [saveSettingsMutation] = useMutation(saveMappSettings)
  const [config, setConfig] = useState<MappSettings>(defaultConfigValues)
  const [isSaving, setIsSaving] = useState(false)
  const [configLoading, setConfigLoading] = useState(true)

  const saveSettings = async () => {
    setIsSaving(true)
    await saveSettingsMutation({
      variables: { settings: JSON.stringify({...defaultConfigValues, ...config }) },
    })
    setIsSaving(false)
  }

  const updateConfig: MappSettingsProvider['updateConfig'] = newValue => {
    setConfig((oldConfig: MappSettings) => {
      return {
        ...oldConfig,
        ...newValue,
      }
    })
  }

  useEffect(() => {
    let settings = dataSettingsSchema?.appSettings?.message
    if (!settings) {
      return
    }

    settings = JSON.parse(settings)
    const tiAndAcProps = ['acId', 'acM', 'tiId', 'tiResponder']
    tiAndAcProps.forEach(prop => {
      if (settings[prop] === '0' || !settings.hasOwnProperty(prop)) {
        settings[prop] === '';
      } 
    })
    setConfig(settings)
    setConfigLoading(false)
  }, [dataSettingsSchema])

  return (
    <Config.Provider
      value={{
        config,
        saveSettings,
        configLoading,
        isSaving,
        setConfig,
        updateConfig,
      }}
    >
      {props.children}
    </Config.Provider>
  )
}

export default Config
