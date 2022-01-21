import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-apollo";

import settingsSchema from "../queries/settingsSchema.gql";
import saveMappSettings from "../queries/saveSettings.gql";

const Config = React.createContext<MappSettingsProvider>({
  tiId: "",
  tiResponder: "",
  acId: "",
  acM: "",
  saveSettings: (_settings) => {},
  configLoading: true,
  isSaving: false,
});

export const ConfigProvider: React.FC = (props) => {
  const { data: dataSettingsSchema } = useQuery(settingsSchema);
  const [saveSettingsMutation] = useMutation(saveMappSettings);
  const [config, setConfig] = useState<MappSettings>({
    tiId: "",
    tiResponder: "responder.wt-safetag.com",
    acId: "",
    acM: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  const saveSettings = async (settingsData: MappSettings) => {
    setIsSaving(true);
    const settings = JSON.stringify(settingsData);

    await saveSettingsMutation({
      variables: { settings },
    });
    setIsSaving(false);
  };

  useEffect(() => {
    const value = dataSettingsSchema?.appSettings?.message;

    if (value) {
      setConfig(JSON.parse(value));
      setConfigLoading(false);
    }
  }, [dataSettingsSchema]);

  return (
    <Config.Provider
      value={{
        tiId: config.tiId,
        tiResponder: config.tiResponder,
        acId: config.acId,
        acM: config.acM,
        saveSettings,
        configLoading,
        isSaving,
      }}
    >
      {props.children}
    </Config.Provider>
  );
};
