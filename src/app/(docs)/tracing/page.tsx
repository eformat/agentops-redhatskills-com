import { QuickNav } from '@/components/QuickNav';

export default function TracingPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Tracing</h1>
        <p className="MdSubtitle">
          Send agent traces from any framework to MLflow on OpenShift AI.
        </p>
        <p className="MdP">
          Agent tracing captures the full execution path of an agent — every LLM call, tool
          invocation, and decision point — and sends it to MLflow for storage, visualization,
          and analysis. Traces let you debug failures, measure latency, and understand how
          your agent arrives at its answers.
        </p>
      </div>
    </>
  );
}
