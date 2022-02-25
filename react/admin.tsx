import type { FC } from 'react'
import React, { useState } from 'react'
import { FormattedMessage, useIntl, FormattedHTMLMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Tabs,
  Tab,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  /* @ts-ignore */
} from 'vtex.styleguide'

import { ConfigProvider } from './provider/ConfigProvider'
import Settings from './components/settings'

const Admin: FC = () => {
  const intl = useIntl()
  const [activeTab, setActiveTab] = useState(1)

  return (
    <ConfigProvider>
      <Layout
        pageHeader={
          <PageHeader
            title={intl.formatMessage({ id: 'admin/mapp-cloud.header' })}
          >
            <Button
              variation="primary"
              size="large"
              onClick={() => {
                window.open('https://portal.mapp.com/sign-up-wizard')
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
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.tracking-tab',
              })}
              active={activeTab === 1}
              onClick={() => {
                setActiveTab(1)
              }}
            >
              <Settings />
            </Tab>
            <Tab
              label={intl.formatMessage({
                id: 'admin/mapp-cloud.insights-tab',
              })}
              active={activeTab === 2}
              onClick={() => {
                setActiveTab(2)
              }}
            >
              <p>
                <FormattedHTMLMessage id="admin/mapp-cloud.insights-info" />
              </p>
            </Tab>
            <Tab
              label={intl.formatMessage({ id: 'admin/mapp-cloud.engage-tab' })}
              active={activeTab === 3}
              onClick={() => {
                setActiveTab(3)
              }}
            >
              <p>
                <FormattedHTMLMessage id="admin/mapp-cloud.engage-info" />
              </p>
            </Tab>
          </Tabs>
        </PageBlock>
      </Layout>
    </ConfigProvider>
  )
}

export default Admin
