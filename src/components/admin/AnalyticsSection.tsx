'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface AnalyticsSectionProps {
  analyticsProvider: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
}

export default function AnalyticsSection({
  analyticsProvider,
  googleAnalyticsId,
  googleTagManagerId,
}: AnalyticsSectionProps) {
  const [provider, setProvider] = useState(analyticsProvider);

  return (
    <section className="pt-5 border-t border-border-default space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} className="text-action" />
        <h3 className="font-semibold text-sm text-text-heading">Analytics</h3>
      </div>
      <p className="text-xs text-text-muted">Configure o provedor de analytics para rastrear visitantes.</p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="label-field-muted">Provedor de Analytics</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="analytics_provider"
                value="none"
                checked={provider === 'none'}
                onChange={() => setProvider('none')}
                className="check-field"
              />
              <span className="text-sm text-text-heading">Nenhum</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="analytics_provider"
                value="ga4"
                checked={provider === 'ga4'}
                onChange={() => setProvider('ga4')}
                className="check-field"
              />
              <span className="text-sm text-text-heading">Google Analytics (GA4)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="analytics_provider"
                value="gtm"
                checked={provider === 'gtm'}
                onChange={() => setProvider('gtm')}
                className="check-field"
              />
              <span className="text-sm text-text-heading">Google Tag Manager</span>
            </label>
          </div>
        </div>

        {provider === 'ga4' && (
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Google Analytics Measurement ID</label>
            <input
              name="google_analytics_id"
              defaultValue={googleAnalyticsId}
              className="field-input font-mono text-xs"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        )}

        {provider === 'gtm' && (
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Google Tag Manager Container ID</label>
            <input
              name="google_tag_manager_id"
              defaultValue={googleTagManagerId}
              className="field-input font-mono text-xs"
              placeholder="GTM-XXXXXXX"
            />
          </div>
        )}
      </div>
    </section>
  );
}
