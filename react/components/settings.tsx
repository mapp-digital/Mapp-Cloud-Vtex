import type { FC } from "react";
import React, { useContext } from "react";
import { FormattedMessage, useIntl, FormattedHTMLMessage } from "react-intl";
import { Input, Textarea, Divider, Spinner, Button } from "vtex.styleguide";

import Config from "../provider/ConfigProvider";
import ConfigInputWrapper from "./configInputWrapper";

const generateAcquireScript = (id: string, m: string) => {
  if (id === "" || m === "" || id === undefined || m === undefined) {
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

const saveButton = (ctx: MappSettingsProvider) => {
  if (ctx.isSaving) {
    return <Spinner />;
  }

  return (
    <Button
      variation="primary"
      size="small"
      onClick={() => {
        ctx.saveSettings();
      }}
    >
      <FormattedMessage id="admin/mapp-cloud.save" />
    </Button>
  );
};

const Settings: FC = () => {
  const ctx = useContext(Config);
  const intl = useIntl();

  return (
    <React.Fragment>
      <div className="pb6">
        <h2>Mapp Intelligence</h2>
        <p>
          <FormattedHTMLMessage id="admin/mapp-cloud.intelligence-info" />
        </p>
        <div className="pv4">
          <ConfigInputWrapper>
            <Input
              placeholder={intl.formatMessage({
                id: "admin/mapp-cloud.intelligence-trackid-placeholder",
              })}
              size="large"
              name="mapp-track-id"
              id="mapp-track-id"
              value={ctx.config.tiId}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist();
                const { target } = e;

                if (target) {
                  ctx.updateConfig({ tiId: e.target.value });
                }
              }}
              label={intl.formatMessage({
                id: "admin/mapp-cloud.intelligence-trackid-label",
              })}
            />
          </ConfigInputWrapper>
        </div>
        <div className="pv4">
          <ConfigInputWrapper>
            <Input
              placeholder={intl.formatMessage({
                id: "admin/mapp-cloud.intelligence-responder-placeholder",
              })}
              size="large"
              name="mapp-responder-domain"
              id="mapp-responder-domain"
              value={ctx.config.tiResponder}
              label={intl.formatMessage({
                id: "admin/mapp-cloud.intelligence-responder-label",
              })}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist();
                ctx.updateConfig({ tiResponder: e.target.value });
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
        <ConfigInputWrapper>
          <Textarea
            size="large"
            label={intl.formatMessage({
              id: "admin/mapp-cloud.acquire-script-label",
            })}
            onChange={(e: { persist?: any; target: any }) => {
              e.persist();
              ctx.setConfig((oldConfig: MappSettings) => {
                return {
                  ...oldConfig,
                  ...getAcquireParameter(e.target.value),
                };
              });
            }}
            value={generateAcquireScript(ctx.config.acId, ctx.config.acM)}
          />
        </ConfigInputWrapper>
      </div>
      <div style={{ float: "right" }}>{saveButton(ctx)}</div>
    </React.Fragment>
  );
};

export default Settings;
