import type { FC } from 'react'
import React, { useState, useContext } from 'react'
import { FormattedMessage, useIntl, FormattedHTMLMessage } from 'react-intl'
import { Input, Spinner, Button } from 'vtex.styleguide'

import Config from '../provider/ConfigProvider'
import ConfigInputWrapper from './configInputWrapper'

const EngageSettings: FC = () => {
  const ctx = useContext(Config)
  const intl = useIntl()
  const [state, setState] = useState({
    btnLoading: false,
    invalidSettings: false,
    initalRequestSent: false,
  })

  const settingsInfo = () => {
    if (!state.initalRequestSent) {
      return false
    }

    if (!state.invalidSettings) {
      return (
        <div
          style={{ textAlign: 'center', width: '100%' }}
          className="pa3 mt3 bg-success hover-bg-success active-bg-success c-on-success hover-c-on-success active-c-on-success dib mr3"
        >
          Mapp Engage is connected!
        </div>
      )
    }

    return (
      <div
        style={{ textAlign: 'center', width: '100%' }}
        className="pa3 mt3 bg-danger hover-bg-danger active-bg-danger c-on-danger hover-c-on-danger active-c-on-danger dib mr3"
      >
        Mapp Engage failed to connect, some configuration is not correct!
      </div>
    )
  }

  const saveButton = (context: MappSettingsProvider) => {
    if (context.isSaving || state.btnLoading) {
      return <Spinner />
    }

    return (
      <Button
        variation="primary"
        size="small"
        isLoading={state.btnLoading}
        onClick={async () => {
          setState({
            ...state,
            btnLoading: true,
          })

          try {
            await ctx.saveSettings()

            const res = await fetch(
              '/_v/app/vtex-mapp-cloud/checkMappConnectCredentials',
              {
                method: 'GET',
                cache: 'no-cache',
              }
            )

            const invalidSettings = res.status !== 200

            setState({
              ...state,
              btnLoading: false,
              invalidSettings,
              initalRequestSent: true,
            })
          } catch (err) {
            setState({
              ...state,
              btnLoading: false,
            })
          }
        }}
      >
        <FormattedMessage id="admin/mapp-cloud.save" />
      </Button>
    )
  }

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
      <div style={{ justifyContent: 'space-between' }} className="flex">
        <div />
        <div>{saveButton(ctx)}</div>
      </div>
      {settingsInfo()}
    </React.Fragment>
  )
}

export default EngageSettings
