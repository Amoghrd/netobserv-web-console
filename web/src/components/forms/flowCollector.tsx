import React, { FC } from 'react';

import { useNavigate, useParams } from '../../utils/url';
import { flowCollectorUISchema } from './config/uiSchema';
import { ResourceForm } from './resource-form';
import { ResourceWatcher } from './resource-watcher';

export type FlowCollectorFormProps = {
  name?: string;
};

export const FlowCollectorForm: FC<FlowCollectorFormProps> = props => {
  const params = useParams<{ name?: string }>();
  const navigate = useNavigate();

  return (
    <ResourceWatcher
      group="flows.netobserv.io"
      version="v1beta2"
      kind="FlowCollector"
      name={params.name || props.name}
      onSuccess={() => navigate(-1)}
      defaultFrom="CSVExample"
    >
      <ResourceForm uiSchema={flowCollectorUISchema} />
    </ResourceWatcher>
  );
};

export default FlowCollectorForm;
