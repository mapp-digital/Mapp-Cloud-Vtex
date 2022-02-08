import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-apollo";

import settingsSchema from "../queries/settingsSchema.gql";
import saveMappSettings from "../queries/saveSettings.gql";

const defaultConfigValues = {
  tiId: "0",
  tiResponder: "0",
  acId: "0",
  acM: "0",
};

const Config = React.createContext<MappSettingsProvider>({
  config: defaultConfigValues,
  saveSettings: () => {},
  configLoading: true,
  isSaving: false,
  setConfig: () => {},
  updateConfig: () => {},
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
    const settings = {...config};
    if(settings.acId === "") {
      settings.acId = '0';
    }
    if(settings.acM === "") {
      settings.acM = '0';
    }
    if(settings.tiId === "") {
      settings.tiId = '0';
    }
    if(settings.tiResponder === "") {
      settings.tiResponder = '0';
    }
    await saveSettingsMutation({
      variables: { settings: JSON.stringify(settings) },
    });
    setIsSaving(false);
  };

  const updateConfig: MappSettingsProvider["updateConfig"] = (newValue) => {
    setConfig((oldConfig: MappSettings) => {
      return {
        ...oldConfig,
        ...newValue,
      };
    });
  };

  useEffect(() => {
    let settings = dataSettingsSchema?.appSettings?.message;
    if(settings) {
      settings = JSON.parse(settings);
      if(settings.acId === "0") {
        settings.acId = '';
      }
      if(settings.acM === "0") {
        settings.acM = '';
      }
      if(settings.tiId === "0") {
        settings.tiId = '';
      }
      if(settings.tiResponder === "0") {
        settings.tiResponder = '';
      }
      setConfig(settings);
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
        setConfig,
        updateConfig,
      }}
    >
      {props.children}
    </Config.Provider>
  );
};

export default Config;
