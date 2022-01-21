import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl, FormattedHTMLMessage } from "react-intl";
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Tabs,
  Tab,
  Input,
  Textarea,
  Divider,
  Spinner,
} from "vtex.styleguide";
import { useMutation, useQuery } from "react-apollo";

import ConfigInputWrapper from "./components/configInputWrapper";
import settingsSchema from "./queries/settingsSchema.gql";
import saveMappSettings from "./queries/saveSettings.gql";

const Admin: FC = () => {
  const intl = useIntl();
  const { data: dataSettingsSchema } = useQuery(settingsSchema);
  const [saveSettingsMutation] = useMutation(saveMappSettings);
  const [activeTab, setActiveTab] = useState(1);
  const [config, setConfig] = useState<MappSettings>({
    tiId: "",
    tiResponder: "responder.wt-safetag.com",
    acId: "",
    acM: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  const generateAcquireScript = (id: string, m: string) => {
    if (id === "" || m === "") {
      return "";
    }

    return `<script>(function(e){var t=document,n=t.createElement("script");n.async=!0,n.defer=!0,n.src=e,t.getElementsByTagName("head")[0].appendChild(n)})("https://c.flx1.com/${m}-${id}.js?id=${id}&m=${m}")</script>`;
  };

  const getAcquireParameter = (script: string) => {
    const pattern = /\?id=(.+?)&m=(.+?)"/;
    const parameter = pattern.exec(script);

    if (parameter) {
      return {
        acId: parameter[1],
        acM: parameter[2],
      };
    }

    return {
      acId: "",
      acM: "",
    };
  };

  const saveSettings = async (settingsData: MappSettings) => {
    setIsSaving(true);
    const settings = JSON.stringify(settingsData);

    await saveSettingsMutation({
      variables: { settings },
    });
    setIsSaving(false);
  };

  const saveButton = () => {
    if (isSaving) {
      return <Spinner />;
    }

    return (
      <Button
        variation="primary"
        size="small"
        onClick={() => {
          saveSettings(config);
        }}
      >
        <FormattedMessage id="admin/mapp-cloud.save" />
      </Button>
    );
  };

  useEffect(() => {
    const value = dataSettingsSchema?.appSettings?.message;

    if (value) {
      setConfig(JSON.parse(value));
      setConfigLoading(false);
    }
  }, [dataSettingsSchema]);

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={intl.formatMessage({ id: "admin/mapp-cloud.header" })}
        >
          <Button
            variation="primary"
            size="large"
            onClick={() => {
              window.open("https://portal.mapp.com/sign-up-wizard");
            }}
          >
            <FormattedMessage id="admin/mapp-cloud.button" />
          </Button>
        </PageHeader>
      }
    >
      <PageBlock>
        <Tabs>
          <Tab
            label={intl.formatMessage({ id: "admin/mapp-cloud.tracking-tab" })}
            active={activeTab === 1}
            onClick={() => {
              setActiveTab(1);
            }}
          >
            <div className="pb6">
              <h2>Mapp Intelligence</h2>
              <p>
                <FormattedHTMLMessage id="admin/mapp-cloud.intelligence-info" />
              </p>
              <div className="pv4">
                <ConfigInputWrapper isloading={configLoading}>
                  <Input
                    placeholder={intl.formatMessage({
                      id: "admin/mapp-cloud.intelligence-trackid-placeholder",
                    })}
                    size="large"
                    name="mapp-track-id"
                    id="mapp-track-id"
                    value={config.tiId}
                    onChange={(e: { persist?: any; target: any }) => {
                      e.persist();
                      const { target } = e;

                      if (target) {
                        setConfig((oldConfig) => {
                          return {
                            ...oldConfig,
                            tiId: e.target.value,
                          };
                        });
                      }
                    }}
                    label={intl.formatMessage({
                      id: "admin/mapp-cloud.intelligence-trackid-label",
                    })}
                  />
                </ConfigInputWrapper>
              </div>
              <div className="pv4">
                <ConfigInputWrapper isloading={configLoading}>
                  <Input
                    placeholder={intl.formatMessage({
                      id: "admin/mapp-cloud.intelligence-responder-placeholder",
                    })}
                    size="large"
                    name="mapp-responder-domain"
                    id="mapp-responder-domain"
                    value={config.tiResponder}
                    label={intl.formatMessage({
                      id: "admin/mapp-cloud.intelligence-responder-label",
                    })}
                    onChange={(e: { persist?: any; target: any }) => {
                      e.persist();
                      setConfig((oldConfig) => {
                        return {
                          ...oldConfig,
                          tiResponder: e.target.value,
                        };
                      });
                    }}
                  />
                </ConfigInputWrapper>
              </div>
            </div>
            <Divider orientation="horizontal" />
            <h2>Mapp Acquire</h2>
            <p>
              <FormattedHTMLMessage id="admin/mapp-cloud.acquire-info" />
            </p>
            <div className="pv4">
              <ConfigInputWrapper isloading={configLoading}>
                <Textarea
                  size="large"
                  label={intl.formatMessage({
                    id: "admin/mapp-cloud.acquire-script-label",
                  })}
                  onChange={(e: { persist?: any; target: any }) => {
                    e.persist();
                    setConfig((oldConfig) => {
                      return {
                        ...oldConfig,
                        ...getAcquireParameter(e.target.value),
                      };
                    });
                  }}
                  value={generateAcquireScript(config.acId, config.acM)}
                />
              </ConfigInputWrapper>
            </div>
            <div style={{ float: "right" }}>{saveButton()}</div>
          </Tab>
          <Tab
            label={intl.formatMessage({ id: "admin/mapp-cloud.insights-tab" })}
            active={activeTab === 2}
            onClick={() => {
              setActiveTab(2);
            }}
          >
            <p>
              <FormattedHTMLMessage id="admin/mapp-cloud.insights-info" />
            </p>
          </Tab>
          <Tab
            label={intl.formatMessage({ id: "admin/mapp-cloud.engage-tab" })}
            active={activeTab === 3}
            onClick={() => {
              setActiveTab(3);
            }}
          >
            <p>
              <FormattedHTMLMessage id="admin/mapp-cloud.engage-info" />
            </p>
          </Tab>
        </Tabs>
      </PageBlock>
    </Layout>
  );
};

export default Admin;
