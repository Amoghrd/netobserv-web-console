import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Text,
  TextVariants
} from '@patternfly/react-core';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PromDisabledMetrics, PromMissingLabels, PromUnsupported, StructuredError } from '../../utils/errors';
import { ErrorSuggestions } from './error-suggestions';
import './panel-error-indicator.css';

export interface PanelErrorIndicatorProps {
  error: StructuredError | string;
  metricType?: string;
  showDetails?: boolean;
}

export const PanelErrorIndicator: React.FC<PanelErrorIndicatorProps> = ({ error, metricType, showDetails = true }) => {
  const { t } = useTranslation('plugin__netobserv-plugin');

  // Set different error icon depending on the severity (e.g. configuration error is less severe)
  const isCritical =
    !PromUnsupported.isTypeOf(error) && !PromDisabledMetrics.isTypeOf(error) && !PromMissingLabels.isTypeOf(error);

  return (
    <Bullseye className="panel-error-indicator">
      <EmptyState>
        <EmptyStateHeader
          titleText={t('Failed to load {{metric}}', { metric: metricType || t('metric') })}
          headingLevel="h3"
          icon={<EmptyStateIcon icon={isCritical ? ExclamationCircleIcon : ExclamationTriangleIcon} />}
        />
        {showDetails && (
          <EmptyStateBody className="panel-error-body">
            <Text component={TextVariants.p} className="panel-error-message">
              {String(error)}
            </Text>
            {typeof error !== 'string' && <ErrorSuggestions error={error} />}
          </EmptyStateBody>
        )}
      </EmptyState>
    </Bullseye>
  );
};

export default PanelErrorIndicator;
