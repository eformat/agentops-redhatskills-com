import { QuickNav } from '@/components/QuickNav';
import { CodeBlock } from '@/components/CodeBlock';
import { highlight } from '@/utils/highlight';
import Link from 'next/link';

const topics = [
  { title: 'Basic Agents', href: '/basic-agents', description: 'Build your first agent with step-by-step examples across popular frameworks.' },
  { title: 'Security', href: '/security', description: 'Secure agent communication, authentication, and authorization.' },
  { title: 'Tracing', href: '/tracing', description: 'Send agent traces from any framework to MLflow on OpenShift AI.' },
  { title: 'Evaluation', href: '/evaluation', description: 'Measure agent quality, correctness, and safety.' },
  { title: 'Identity', href: '/identity', description: 'Workload identity for agents using SPIRE, SPIFFE, and service accounts.' },
  { title: 'Observability', href: '/observability', description: 'Metrics, logs, and dashboards for agent operations.' },
  { title: 'Catalog', href: '/catalog', description: 'Discover, register, and version agents, tools, and prompts.' },
  { title: 'Lifecycle', href: '/lifecycle', description: 'Build, deploy, update, and retire agents on OpenShift.' },
];

const quickNavItems = [
  { id: 'topics', text: 'Topics', level: 2 },
  { id: 'built-for-humans-and-agents', text: 'Built for Humans and Agents', level: 2 },
  { id: 'point-your-agent-here', text: 'Point your agent here', level: 3 },
  { id: 'agentsmd', text: 'AGENTS.md', level: 3 },
  { id: 'view-as-markdown', text: 'View as Markdown', level: 3 },
];

const claudeMdExample = highlight(
`## Reference Documentation
- AgentOps docs: https://agentops.redhatskills.com/AGENTS.md`
);

const agentsUrl = highlight(
`https://agentops.redhatskills.com/AGENTS.md`
);

const urlPattern = highlight(
`# HTML (for humans)
https://agentops.redhatskills.com/identity/using-spiffe-spire

# Markdown (for agents)
https://agentops.redhatskills.com/identity/using-spiffe-spire.md`
);

export default function Home() {
  return (
    <>
      <QuickNav items={quickNavItems} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Red Hat AI AgentOps</h1>
        <p className="MdSubtitle">
          Connect any agent framework to the Red Hat OpenShift AI platform.
        </p>

        <p className="MdP">
          AgentOps provides documentation and working code examples for connecting
          agent frameworks to Red Hat OpenShift AI. Every page on this site is
          designed to be read by <strong className="MdStrong">humans</strong> in
          a browser and consumed by <strong className="MdStrong">AI agents</strong> as
          structured markdown — the same content, two formats.
        </p>

        <h2 className="MdH2" id="topics">Topics</h2>

        <ul className="MdUl">
          {topics.map((t) => (
            <li key={t.href}>
              <Link className="MdLink" href={t.href}>
                <strong className="MdStrong">{t.title}</strong>
              </Link>
              {' — '}{t.description}
            </li>
          ))}
        </ul>

        <h2 className="MdH2" id="built-for-humans-and-agents">Built for Humans and Agents</h2>

        <p className="MdP">
          This site serves the same documentation in two ways. Humans get a
          rich browsable UI with syntax-highlighted code, tabbed examples, and
          responsive navigation. AI agents get clean markdown with the same
          content — no scraping, no parsing HTML, no losing context to
          boilerplate.
        </p>

        <h3 className="MdH3" id="point-your-agent-here">Point your agent here</h3>

        <p className="MdP">
          Add the site URL to your agent&apos;s context so it can fetch documentation
          on demand. In <strong className="MdStrong">Claude Code</strong>, add a
          reference to your <code className="MdCode">CLAUDE.md</code>:
        </p>

        <CodeBlock title="CLAUDE.md">{claudeMdExample}</CodeBlock>

        <p className="MdP">
          For any AI coding agent or LLM tool, point it at
          the <code className="MdCode">AGENTS.md</code> URL — it lists every page
          with its markdown URL:
        </p>

        <CodeBlock title="Any agent / LLM tool">{agentsUrl}</CodeBlock>

        <p className="MdP">
          Your agent can fetch that index, find the relevant page, and retrieve the
          full markdown content — no API key required, no rate limits.
        </p>

        <h3 className="MdH3" id="agentsmd">AGENTS.md</h3>

        <p className="MdP">
          The{' '}
          <a className="MdLink" href="/AGENTS.md">AGENTS.md</a>{' '}
          file at the site root is an index of all documentation pages with their
          markdown URLs. It follows the emerging{' '}
          <a className="MdLink" href="https://agentskills.io/specification">agentskills.io</a>{' '}
          convention — a machine-readable entry point that tells agents what
          content is available and where to find it.
        </p>

        <div className="ApiTable">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Format</th>
                <th>Audience</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code className="MdCode">/AGENTS.md</code></td>
                <td>Markdown</td>
                <td>AI agents — page index with all markdown URLs</td>
              </tr>
              <tr>
                <td><code className="MdCode">/tracing/connect-to-mlflow</code></td>
                <td>HTML</td>
                <td>Humans — rich UI with syntax highlighting and navigation</td>
              </tr>
              <tr>
                <td><code className="MdCode">/tracing/connect-to-mlflow.md</code></td>
                <td>Markdown</td>
                <td>AI agents — same content as plain markdown</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="MdH3" id="view-as-markdown">View as Markdown</h3>

        <p className="MdP">
          Every content page includes a <strong className="MdStrong">&ldquo;View as Markdown&rdquo;</strong> link
          at the top. Click it to see the raw <code className="MdCode">.md</code> source
          that agents consume. Append <code className="MdCode">.md</code> to any page
          URL to get the markdown version directly:
        </p>

        <CodeBlock title="URL pattern">{urlPattern}</CodeBlock>

      </div>
    </>
  );
}
