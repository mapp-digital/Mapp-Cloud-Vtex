import type { FC } from "react";
import React from "react";
import { Spinner } from "vtex.styleguide";

const output = (loading: boolean, children: any) => {
  if (loading) {
    return <Spinner />;
  }

  if (children) {
    return children;
  }
};

const ConfigInputWrapper: FC<{ isloading: boolean }> = (props) => {
  return (
    <React.Fragment>{output(props.isloading, props.children)}</React.Fragment>
  );
};

export default ConfigInputWrapper;
