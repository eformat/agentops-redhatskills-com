import { QuickNav } from '@/components/QuickNav';

export default function SecurityPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Security</h1>
        <p className="MdSubtitle">
          Secure agent communication, authentication, and authorization on OpenShift.
        </p>
        <p className="MdP">
          Agent security covers workload identity (SPIRE/SPIFFE), mutual TLS between agents,
          policy enforcement at the agent gateway, and secrets management for LLM API keys
          and tool credentials.
        </p>
      </div>
    </>
  );
}
