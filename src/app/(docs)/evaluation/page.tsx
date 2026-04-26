import { QuickNav } from '@/components/QuickNav';

export default function EvaluationPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Evaluation</h1>
        <p className="MdSubtitle">
          Measure agent quality, correctness, and safety with automated evaluation pipelines.
        </p>
        <p className="MdP">
          Evaluation covers LLM-as-judge scoring, retrieval accuracy metrics (MRR, NDCG),
          tool-use correctness, response latency SLOs, and safety guardrail pass rates.
          MLflow Evaluate provides built-in support for running these assessments against
          collected traces.
        </p>
      </div>
    </>
  );
}
