import { QuickNav } from '@/components/QuickNav';

export default function LifecyclePage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Lifecycle</h1>
        <p className="MdSubtitle">
          Build, deploy, update, and retire agents on OpenShift.
        </p>
        <p className="MdP">
          Agent lifecycle management covers CI/CD pipelines for agent builds, blue-green
          and canary deployment strategies, rollback procedures, prompt version promotion
          (staging → production), and graceful agent retirement with traffic draining.
        </p>
      </div>
    </>
  );
}
