import React, { FC } from 'react'
import { FormattedMessage, useIntl } from 'react-intl';
import { Layout, PageHeader, PageBlock, Button } from 'vtex.styleguide';

const Admin: FC = () => {
    const intl = useIntl();
    return (<Layout
        pageHeader={
            <PageHeader
                title={intl.formatMessage({ id: "admin/mapp-cloud.header" })}
                subtitle={intl.formatMessage({ id: "admin/mapp-cloud.subtitle" })}
            >
                <Button variation="primary">
                    <FormattedMessage id="admin/mapp-cloud.button" />
                </Button>
            </PageHeader>
        }>
        <PageBlock>
            <FormattedMessage id="admin/mapp-cloud.text" />
        </PageBlock>
    </Layout>)
}

export default Admin;