import { QuickNav } from '@/components/QuickNav';

export default function BasicAgentsPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Basic Agents</h1>
        <p className="MdSubtitle">
          Hello-world agent examples you can run in minutes.
        </p>
        <p className="MdP">
          Start here to get a working agent running against OpenAI, a local model,
          or an OpenAI-compatible endpoint on OpenShift AI. Each example is a single
          Python file with one tool and one question — the simplest foundation to
          build on.
        </p>
      </div>
    </>
  );
}
