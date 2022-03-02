import type { FC } from 'react'
import React, { useContext } from 'react'
import { FormattedMessage, useIntl, FormattedHTMLMessage } from 'react-intl'
import { Input, Spinner, Button } from 'vtex.styleguide'

import Config from '../provider/ConfigProvider'
import ConfigInputWrapper from './configInputWrapper'

const saveButton = (ctx: MappSettingsProvider) => {
  if (ctx.isSaving) {
    return <Spinner />
  }

  return (
    <Button
      variation="primary"
      size="small"
      onClick={() => {
        ctx.saveSettings()
      }}
    >
      <FormattedMessage id="admin/mapp-cloud.save" />
    </Button>
  )
}

const EngageSettings: FC = () => {
  const ctx = useContext(Config)
  const intl = useIntl()

  return (
    <React.Fragment>
      <div className="pb6">
        <h2>Mapp Engage</h2>
        <p>
          <FormattedHTMLMessage id="admin/mapp-cloud.engage-info" />
        </p>
        <div className="pv4">
          <ConfigInputWrapper>
            <Input
              placeholder={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-api-placeholder',
              })}
              size="large"
              name="mapp-api-url"
              id="mapp-api-url"
              value={ctx.config.engageApiUrl}
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-api-label',
              })}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist()
                ctx.updateConfig({ engageApiUrl: e.target.value })
              }}
            />
          </ConfigInputWrapper>
        </div>
        <div className="pv4">
          <ConfigInputWrapper>
            <Input
              placeholder={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-integration-id-placeholder',
              })}
              size="large"
              name="mapp-integration-id"
              id="mapp-integration-id"
              value={ctx.config.engageIntegrationId}
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-integration-id-label',
              })}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist()
                ctx.updateConfig({ engageIntegrationId: e.target.value })
              }}
            />
          </ConfigInputWrapper>
        </div>
        <div className="pv4">
          <ConfigInputWrapper>
            <Input
              placeholder={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-api-secret-placeholder',
              })}
              size="large"
              name="mapp-api-secret"
              id="mapp-api-secret"
              value={ctx.config.engageSecret}
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-api-secret-label',
              })}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist()
                ctx.updateConfig({ engageSecret: e.target.value })
              }}
            />
          </ConfigInputWrapper>
        </div>
      </div>
      <div style={{ float: 'right' }}>{saveButton(ctx)}</div>
    </React.Fragment>
  )
}

export default EngageSettings
