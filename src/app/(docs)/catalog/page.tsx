import { QuickNav } from '@/components/QuickNav';

export default function CatalogPage() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Catalog</h1>
        <p className="MdSubtitle">
          Discover, register, and version agents, tools, and prompts.
        </p>
        <p className="MdP">
          The agent catalog provides a registry for published agents, their capabilities,
          API schemas (A2A protocol), available tools, and prompt templates. It integrates
          with MLflow&apos;s prompt registry for version-controlled prompt management.
        </p>
      </div>
    </>
  );
}
