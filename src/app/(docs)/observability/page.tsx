import { QuickNav } from '@/components/QuickNav';

export default function ObservabilityPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Observability</h1>
        <p className="MdSubtitle">
          Metrics, logs, and dashboards for agent operations at scale.
        </p>
        <p className="MdP">
          Observability extends beyond tracing to include real-time metrics (token throughput,
          error rates, latency percentiles), structured logging, alerting on anomalous agent
          behavior, and dashboards for fleet-wide visibility.
        </p>
      </div>
    </>
  );
}
