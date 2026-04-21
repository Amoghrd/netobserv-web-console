import { Button, Content, ContentVariants } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LokiClientError,
  LokiResponseError,
  PromDisabledMetrics,
  PromMissingLabels,
  PromUnsupported,
  StructuredError
} from '../../utils/errors';
import { Link } from '../../utils/url';
import './error-suggestions.css';

export interface ErrorSuggestionsProps {
  error: StructuredError;
  compact?: boolean;
}

export const ErrorSuggestions: React.FC<ErrorSuggestionsProps> = ({ error, compact = false }) => {
  const { t } = useTranslation('plugin__netobserv-plugin');

  const msg = React.useMemo(() => error.toString(), [error]);

  // Display only if related to Loki or if we have a suggestion
  const isLokiRelated = LokiResponseError.isTypeOf(error) || LokiClientError.isTypeOf(error);
  const suggestions =
    PromUnsupported.isTypeOf(error) || PromMissingLabels.isTypeOf(error) || PromDisabledMetrics.isTypeOf(error)
      ? error.getSuggestions()
      : [];
  const hasSuggestions =
    suggestions.length > 0 ||
    msg.includes('max entries limit') ||
    msg.includes('deadline exceeded') ||
    msg.includes('maximum of series') ||
    msg.includes('too many outstanding requests') ||
    msg.includes('time range exceeds') ||
    msg.includes('maximum resolution') ||
    msg.includes('input size too long') ||
    msg.includes('Network Error') ||
    msg.includes('status code 401') ||
    msg.includes('status code 403');

  if (!hasSuggestions && !isLokiRelated) {
    return null;
  }

  return (
    <Content className={`error-suggestions ${compact ? 'error-suggestions-compact' : ''}`}>
      {!compact && hasSuggestions && (
        <Content component={ContentVariants.p}>
          <strong>{t('Suggestions to avoid this error:')}</strong>
        </Content>
      )}

      {suggestions.map((sugg, idx) => {
        return (
          <Content key={`suggestion_${idx}`} component={ContentVariants.blockquote}>
            {sugg}
          </Content>
        );
      })}

      {msg.includes('max entries limit') && (
        <>
          <Content component={ContentVariants.blockquote}>
            {t('Reduce the Query Options -> limit to reduce the number of results')}
          </Content>
          <Content component={ContentVariants.blockquote}>
            {t('Increase Loki "max_entries_limit_per_query" entry in configuration file')}
          </Content>
        </>
      )}

      {(msg.includes('deadline exceeded') ||
        msg.includes('maximum of series') ||
        msg.includes('too many outstanding requests')) && (
        <>
          <Content component={ContentVariants.blockquote}>
            {t('Add Namespace, Owner or Resource filters (which use indexed fields) to improve the query performance')}
          </Content>
          <Content component={ContentVariants.blockquote}>
            {t('Reduce limit and time range to decrease the number of results')}
          </Content>
          <Content component={ContentVariants.blockquote}>
            {t('Increase time step to decrease the number of parallel queries')}
          </Content>
          {msg.includes('too many outstanding requests') && (
            <Content component={ContentVariants.blockquote}>
              {t(
                'Ensure Loki config contains "parallelise_shardable_queries: true" and "max_outstanding_requests_per_tenant: 2048"'
              )}
            </Content>
          )}
        </>
      )}

      {(msg.includes('time range exceeds') || msg.includes('maximum resolution')) && (
        <>
          <Content component={ContentVariants.blockquote}>
            {t('Reduce the time range to decrease the number of results')}
          </Content>
          <Content component={ContentVariants.blockquote}>
            {t('Increase Loki "max_query_length" entry in configuration file')}
          </Content>
        </>
      )}

      {msg.includes('input size too long') && (
        <>
          <Content component={ContentVariants.blockquote}>
            {t('This error is generally seen when cluster admin groups are not properly configured.')}{' '}
            {t('Click the link below for more help.')}
          </Content>
          <Button
            variant="link"
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            component={(props: React.FunctionComponent) => (
              <Link
                {...props}
                target="_blank"
                to={{
                  pathname: 'https://github.com/netobserv/documents/blob/main/loki_operator.md',
                  hash: 'loki-input-size-too-long-error'
                }}
              />
            )}
          >
            {t('More information')}
          </Button>
        </>
      )}

      {msg.includes('Network Error') && (
        <Content component={ContentVariants.blockquote}>
          {t(`Check your connectivity with cluster / console plugin pod`)}
        </Content>
      )}

      {(msg.includes('status code 401') || msg.includes('status code 403')) && (
        <>
          <Content component={ContentVariants.blockquote}>{t(`Check current user permissions`)}</Content>
          {msg.includes('user not an admin') ? (
            <Content component={ContentVariants.blockquote}>
              {t(
                `This deployment mode does not support non-admin users. Check FlowCollector spec.loki.manual.authToken`
              )}
            </Content>
          ) : (
            <>
              {msg.includes('from Loki') && (
                <>
                  <Content component={ContentVariants.blockquote}>
                    {t(`For LokiStack, your user must either:`)}
                    <Content component="ul">
                      <Content component="li">
                        {t(`have the 'netobserv-loki-reader' cluster role, which allows multi-tenancy`)}
                      </Content>
                      <Content component="li">
                        {t(`or be in the 'cluster-admin' group (not the same as the 'cluster-admin' role)`)}
                      </Content>
                      <Content component="li">
                        {t(
                          `or LokiStack spec.tenants.openshift.adminGroups must be configured with a group this user belongs to`
                        )}
                      </Content>
                    </Content>
                  </Content>
                  <Content component={ContentVariants.blockquote}>
                    {t(`For other configurations, refer to FlowCollector spec.loki.manual.authToken`)}
                  </Content>
                </>
              )}
            </>
          )}
          {msg.includes('from Prometheus') && (
            <Content component={ContentVariants.blockquote}>
              {t(`For metrics access, your user must either:`)}
              <Content component="ul">
                <Content component="li">{t(`have the 'netobserv-metrics-reader' namespace-scoped role`)}</Content>
                <Content component="li">
                  {t(`or for cluster-wide access, have the 'cluster-monitoring-view' cluster role`)}
                </Content>
              </Content>
            </Content>
          )}
        </>
      )}

      {isLokiRelated && (
        <div className="error-suggestions-links">
          <Button
            variant="link"
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            isInline
            component={(props: React.FunctionComponent) => (
              <Link
                {...props}
                target="_blank"
                to={{
                  pathname:
                    'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/network_observability/installing-network-observability-operators',
                  hash: 'network-observability-loki-installation_network_observability'
                }}
              />
            )}
          >
            {t('Configuring the Loki Operator')}
          </Button>{' '}
          <Button
            variant="link"
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            isInline
            component={(props: React.FunctionComponent) => (
              <Link
                {...props}
                target="_blank"
                to={{ pathname: 'https://grafana.com/docs/loki/latest/configuration/' }}
              />
            )}
          >
            {t('Configuring Grafana Loki (community)')}
          </Button>
        </div>
      )}
    </Content>
  );
};

export default ErrorSuggestions;
