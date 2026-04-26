import { QuickNav } from '@/components/QuickNav';

export default function IdentityPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Identity</h1>
        <p className="MdSubtitle">
          Workload identity for agents using SPIRE, SPIFFE, and Kubernetes service accounts.
        </p>
        <p className="MdP">
          Every agent needs a cryptographic identity to authenticate to other services, sign
          traces, and prove its provenance. SPIRE provides X.509 SVIDs and JWT SVIDs that
          are automatically rotated and scoped to the agent&apos;s workload.
        </p>
      </div>
    </>
  );
}
