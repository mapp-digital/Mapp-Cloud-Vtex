import type { FC } from 'react'
import React, { useEffect, useState, useContext } from 'react'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
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
  mappMessages: Array<{
    value: string
    label: any
  }>
}

let ctxConfig: any

const EngageSettings: FC = () => {
  const ctx = useContext(Config)
  const intl = useIntl()
  const [state, setState] = useState<EngageSettingsState>({
    btnLoading: false,
    invalidSettings: false,
    initalRequestSent: false,
    groups: [],
    mappMessages: [],
  })

  if (ctxConfig === undefined) {
    ctxConfig = { ...ctx.config }
  }

  const hasInitialSettins =
    ctxConfig.engageApiUrl &&
    ctxConfig.engageApiUrl !== '0' &&
    ctxConfig.engageSecret &&
    ctxConfig.engageSecret !== '0' &&
    ctxConfig.engageIntegrationId &&
    ctxConfig.engageIntegrationId !== '0'

  const getGroups = async () => {
    try {
      const res = await fetch('/_v/app/vtex-mapp-cloud/groups', {
        method: 'GET',
        cache: 'no-cache',
      })

      if (res.status !== 200) {
        throw new Error('Response for groups not 200')
      }

      const body = await res.json()

      const groups = Object.keys(body).map(key => {
        return {
          value: key,
          label: body[key],
        }
      })

      return groups
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }

    return []
  }

  const getMappMessages = async () => {
    try {
      const res = await fetch('/_v/app/vtex-mapp-cloud/mappMessages', {
        method: 'GET',
        cache: 'no-cache',
      })

      if (res.status !== 200) {
        throw new Error('Response for messages not 200')
      }

      const body = await res.json()

      if (!body || body.length <= 0) {
        return []
      }

      const mappMessages = Object.keys(body).map(key => {
        return {
          value: key,
          label: body[key],
        }
      })

      mappMessages.unshift({
        value: '0',
        label: 'Disabled',
      })

      return mappMessages
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }

    return []
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
            let groups: Array<{
              value: string
              label: any
            }> = []

            let mappMessages: Array<{
              value: string
              label: any
            }> = []

            if (!invalidSettings && state.groups.length === 0) {
              groups = await getGroups()
            }

            if (!invalidSettings && state.mappMessages.length === 0) {
              mappMessages = await getMappMessages()
            }

            if (mappMessages.length > 0 || groups.length > 0) {
              setState(previousState => ({
                ...previousState,
                btnLoading: false,
                invalidSettings,
                initalRequestSent: true,
                mappMessages,
                groups,
              }))
            } else {
              setState(previousState => ({
                ...previousState,
                btnLoading: false,
                invalidSettings,
                initalRequestSent: true,
              }))
            }
          } catch (err) {
            setState(previousState => ({
              ...previousState,
              btnLoading: false,
            }))
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
    ;(async () => {
      if (!hasInitialSettins) {
        return
      }

      const groups = await getGroups()
      const mappMessages = await getMappMessages()

      setState(previousState => ({
        ...previousState,
        groups,
        mappMessages,
      }))
    })()
  }, [])

  const otherConfigOptions = () => {
    const showContent =
      hasInitialSettins ||
      state.groups.length > 0 ||
      state.mappMessages.length > 0

    if (!showContent) {
      return null
    }

    return (
      <div>
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
        <Divider orientation="horizontal" />
        <h2>Mapp Engage Messages</h2>
        <p>
          <FormattedHTMLMessage id="admin/mapp-cloud.engage-message-info" />
        </p>
        <div className="pv4">
          <div className="pv4">
            <ConfigInputWrapper>
              <Dropdown
                label={intl.formatMessage({
                  id: 'admin/mapp-cloud.engage-message-order-created-label',
                })}
                disabled={state.mappMessages.length === 0}
                options={state.mappMessages}
                size="large"
                value={
                  ctx.config.messageOrderCreatedID
                    ? ctx.config.messageOrderCreatedID
                    : '0'
                }
                onChange={(e: { persist?: any; target: any }) => {
                  e.persist()
                  ctx.updateConfig({ messageOrderCreatedID: e.target.value })
                }}
              />
            </ConfigInputWrapper>
          </div>
          <div className="pv4">
            <ConfigInputWrapper>
              <Dropdown
                label={intl.formatMessage({
                  id: 'admin/mapp-cloud.engage-message-order-canceled-label',
                })}
                disabled={state.mappMessages.length === 0}
                options={state.mappMessages}
                size="large"
                value={
                  ctx.config.messageOrderCanceledID
                    ? ctx.config.messageOrderCanceledID
                    : '0'
                }
                onChange={(e: { persist?: any; target: any }) => {
                  e.persist()
                  ctx.updateConfig({ messageOrderCanceledID: e.target.value })
                }}
              />
            </ConfigInputWrapper>
          </div>
          <div className="pv4">
            <ConfigInputWrapper>
              <Dropdown
                label={intl.formatMessage({
                  id: 'admin/mapp-cloud.engage-message-order-approved-label',
                })}
                disabled={state.mappMessages.length === 0}
                options={state.mappMessages}
                size="large"
                value={
                  ctx.config.messageOrderPaymentApprovedID
                    ? ctx.config.messageOrderPaymentApprovedID
                    : '0'
                }
                onChange={(e: { persist?: any; target: any }) => {
                  e.persist()
                  ctx.updateConfig({
                    messageOrderPaymentApprovedID: e.target.value,
                  })
                }}
              />
            </ConfigInputWrapper>
          </div>
          <div className="pv4">
            <ConfigInputWrapper>
              <Dropdown
                label={intl.formatMessage({
                  id: 'admin/mapp-cloud.engage-message-order-invoiced-label',
                })}
                disabled={state.mappMessages.length === 0}
                options={state.mappMessages}
                size="large"
                value={
                  ctx.config.messageOrderInvoicedID
                    ? ctx.config.messageOrderInvoicedID
                    : '0'
                }
                onChange={(e: { persist?: any; target: any }) => {
                  e.persist()
                  ctx.updateConfig({ messageOrderInvoicedID: e.target.value })
                }}
              />
            </ConfigInputWrapper>
          </div>
        </div>
      </div>
    )
  }

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
              value={
                ctx.config.engageApiUrl !== '0' ? ctx.config.engageApiUrl : ''
              }
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
              value={
                ctx.config.engageIntegrationId !== '0'
                  ? ctx.config.engageIntegrationId
                  : ''
              }
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
              value={
                ctx.config.engageSecret !== '0' ? ctx.config.engageSecret : ''
              }
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
      {otherConfigOptions()}
      <div style={{ justifyContent: 'space-between' }} className="flex">
        <div />
        <div>{saveButton(ctx)}</div>
      </div>
      {settingsInfo()}
    </React.Fragment>
  )
}

export default EngageSettings
