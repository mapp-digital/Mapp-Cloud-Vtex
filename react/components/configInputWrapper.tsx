import type { FC } from 'react'
import React from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-ignore */
import { Spinner } from 'vtex.styleguide'

import Config from '../provider/ConfigProvider'

const output = (loading: boolean, children: React.ReactNode) => {
  if (loading) {
    return <Spinner />
  }

  if (children) {
    return children
  }

  return null
}

const ConfigInputWrapper: FC = props => {
  const ctx = React.useContext(Config)

  return (
    <React.Fragment>{output(ctx.configLoading, props.children)}</React.Fragment>
  )
}

export default ConfigInputWrapper
