import type { FC } from 'react'
import React, { useEffect, useState, useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Input, Spinner, Button, Divider, Dropdown } from 'vtex.styleguide'

import Config from '../provider/ConfigProvider'
import ConfigInputWrapper from './configInputWrapper'

interface EngageSettingsState {
  btnLoading: boolean
  invalidSettings: boolean
  initalRequestSent: boolean
  groups: Array<{
    value: string
    label: any
  }>
}

const EngageSettings: FC = () => {
  const ctx = useContext(Config)
  const intl = useIntl()
  const [state, setState] = useState<EngageSettingsState>({
    btnLoading: false,
    invalidSettings: false,
    initalRequestSent: false,
    groups: [],
  })

  const getGroups = async () => {
    try {
      const res = await fetch('/_v/app/vtex-mapp-cloud/groups', {
        method: 'GET',
        cache: 'no-cache',
      })

      const body = await res.json()

      if (res.status !== 200) {
        throw new Error('Response for groups not 200')
      }

      const groups = Object.keys(body).map(key => {
        return {
          value: key,
          label: body[key],
        }
      })

      setState({
        ...state,
        groups,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

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

            if (!invalidSettings && state.groups.length === 0) {
              await getGroups()
            }

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

  const doubleOptInOptions = [
    { value: 'On', label: 'On' },
    { value: 'Off', label: 'Off' },
  ]

  useEffect(() => {
    getGroups()
  }, [])

  return (
    <React.Fragment>
      <div className="pb6">
        <h2>Integration Configuration</h2>
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
              helpText={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-integration-id-helptext',
              })}
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
              helpText={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-api-secret-helptext',
              })}
              value={ctx.config.engageSecret}
              type="password"
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
      <Divider orientation="horizontal" />
      <h2>Synchronization configuration</h2>
      <div className="pv4">
        <div className="pv4">
          <ConfigInputWrapper>
            <Dropdown
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-newsletter-doubleop-label',
              })}
              size="large"
              options={doubleOptInOptions}
              value={ctx.config.newsletterDoubleOptIn}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist()
                ctx.updateConfig({ newsletterDoubleOptIn: e.target.value })
              }}
            />
          </ConfigInputWrapper>
        </div>
      </div>
      <Divider orientation="horizontal" />
      <h2>Mapp Engage Group Configuration</h2>
      <div className="pv4">
        <div className="pv4">
          <ConfigInputWrapper>
            <Dropdown
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-customers-group-label',
              })}
              disabled={state.groups.length === 0}
              options={state.groups}
              size="large"
              value={ctx.config.customerGroupID}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist()
                ctx.updateConfig({ customerGroupID: e.target.value })
              }}
            />
          </ConfigInputWrapper>
        </div>
        <div className="pv4">
          <ConfigInputWrapper>
            <Dropdown
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.engage-subscribers-group-label',
              })}
              disabled={state.groups.length === 0}
              options={state.groups}
              size="large"
              value={ctx.config.subscribersGroupID}
              onChange={(e: { persist?: any; target: any }) => {
                e.persist()
                ctx.updateConfig({ subscribersGroupID: e.target.value })
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
