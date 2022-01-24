import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-apollo";

import settingsSchema from "../queries/settingsSchema.gql";
import saveMappSettings from "../queries/saveSettings.gql";

const Config = React.createContext<MappSettingsProvider>({
  config: {
    tiId: "",
    tiResponder: "",
    acId: "",
    acM: "",
  },
  saveSettings: () => {},
  configLoading: true,
  isSaving: false,
  setConfig: () => {}
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

  const saveSettings = async () => {
    setIsSaving(true);
    const settings = JSON.stringify(config);

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
        config,
        saveSettings,
        configLoading,
        isSaving,
        setConfig
      }}
    >
      {props.children}
    </Config.Provider>
  );
};

export default Config;