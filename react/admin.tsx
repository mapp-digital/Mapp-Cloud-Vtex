import React, { FC } from 'react'
import { Layout, PageHeader, PageBlock, Button } from 'vtex.styleguide'

const Admin: FC = () => {
    return (<Layout
        pageHeader={
            <PageHeader
                title="Mapp Cloud Integration"
                subtitle="Subtitle Lorem ipsum dolor sit amet">
                <Button variation="primary">Create Account</Button>
            </PageHeader>
        }>
        <PageBlock>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada ut neque id pharetra. Suspendisse tortor eros, sagittis at molestie at, semper mollis urna. Sed porta ipsum ac vulputate ultrices. Mauris sed libero quis risus rutrum efficitur in nec justo.
        </PageBlock>
    </Layout>)
}

export default Admin;