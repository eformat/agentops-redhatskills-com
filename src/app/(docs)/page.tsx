import { QuickNav } from '@/components/QuickNav';
import { CodeBlock } from '@/components/CodeBlock';
import { highlight } from '@/utils/highlight';
import Link from 'next/link';

const topics = [
  { title: 'Basic Agents', href: '/basic-agents', description: 'Build your first agent with step-by-step examples across popular frameworks.' },
  { title: 'Security', href: '/security', description: 'Sandbox code execution, authenticate workloads, and enforce policy for agents.' },
  { title: 'Tracing', href: '/tracing', description: 'Send agent traces from any framework to MLflow on OpenShift AI.' },
  { title: 'Evaluation', href: '/evaluation', description: 'Measure agent quality, correctness, and safety.' },
  { title: 'Identity', href: '/identity', description: 'Workload identity for agents using SPIRE, SPIFFE, and service accounts.' },
  { title: 'Observability', href: '/observability', description: 'Metrics, logs, and dashboards for agent operations.' },
  { title: 'Catalog', href: '/catalog', description: 'Discover, register, and version agents, tools, and prompts.' },
  { title: 'Lifecycle', href: '/lifecycle', description: 'Build, deploy, update, and retire agents on OpenShift.' },
];

const quickNavItems = [
  { id: 'topics', text: 'Topics', level: 2 },
  { id: 'built-for-three-audiences', text: 'Built for Three Audiences', level: 2 },
  { id: 'point-your-agent-here', text: 'Point your agent here', level: 3 },
  { id: 'agentsmd', text: 'AGENTS.md', level: 3 },
  { id: 'view-as-markdown', text: 'View as Markdown', level: 3 },
  { id: 'skills-marketplace', text: 'Skills Marketplace', level: 2 },
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

const marketplaceAdd = highlight(
`/plugin marketplace add eformat/agentops-redhatskills-com`
);

const marketplaceInstall = highlight(
`/plugin install langchain-agent@agentops-redhatskills`
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

        <h2 className="MdH2" id="built-for-three-audiences">Built for Three Audiences</h2>

        <p className="MdP">
          This site serves the same content in three ways.{' '}
          <strong className="MdStrong">Humans</strong> get a rich browsable UI
          with syntax-highlighted code, tabbed examples, and responsive
          navigation.{' '}
          <strong className="MdStrong">AI agents</strong> get clean markdown with
          the same content — no scraping, no parsing HTML, no losing context to
          boilerplate. And{' '}
          <strong className="MdStrong">Claude Code</strong> gets a plugin
          marketplace — skills can be installed directly into a session with a
          single command.
        </p>

        <div className="ApiTable">
          <table>
            <thead>
              <tr>
                <th>Audience</th>
                <th>Access</th>
                <th>Format</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Humans</td>
                <td>Browse the site</td>
                <td>HTML with full UI</td>
              </tr>
              <tr>
                <td>AI agents</td>
                <td><code className="MdCode">/AGENTS.md</code> or append <code className="MdCode">.md</code> to any page URL</td>
                <td>Plain markdown</td>
              </tr>
              <tr>
                <td>Claude Code</td>
                <td><code className="MdCode">/plugin marketplace add</code></td>
                <td>Installable skills</td>
              </tr>
            </tbody>
          </table>
        </div>

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

        <h2 className="MdH2" id="skills-marketplace">Skills Marketplace</h2>

        <p className="MdP">
          This site is also a{' '}
          <strong className="MdStrong">Claude Code plugin marketplace</strong>.
          Skills are reusable agent capabilities — scaffolding generators, code
          reviewers, deployment helpers — that you can install directly into your
          Claude Code session.
        </p>

        <p className="MdP">
          Add the marketplace to Claude Code:
        </p>

        <CodeBlock title="Add marketplace">{marketplaceAdd}</CodeBlock>

        <p className="MdP">
          Then install individual skills:
        </p>

        <CodeBlock title="Install a skill">{marketplaceInstall}</CodeBlock>

        <div className="ApiTable">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Link className="MdLink" href="/basic-agents/hello-world#langgraph"><code className="MdCode">langchain-agent</code></Link></td>
                <td>Scaffold a LangChain/LangGraph ReAct agent</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/basic-agents/hello-world#crewai"><code className="MdCode">crewai-agent</code></Link></td>
                <td>Scaffold a CrewAI agent with role-based orchestration</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/basic-agents/hello-world#autogen"><code className="MdCode">autogen-agent</code></Link></td>
                <td>Scaffold an AutoGen multi-agent conversation</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/basic-agents/hello-world#llamaindex"><code className="MdCode">llamaindex-agent</code></Link></td>
                <td>Scaffold a LlamaIndex ReAct agent</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/basic-agents/hello-world#google-adk"><code className="MdCode">google-adk-agent</code></Link></td>
                <td>Scaffold a Google ADK agent with session management</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/basic-agents/hello-world#deploy-on-openshift"><code className="MdCode">agent-deploy-openshift</code></Link></td>
                <td>Deploy a scaffolded agent to OpenShift using UBI 9 S2I</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/tracing/connect-to-mlflow"><code className="MdCode">mlflow-tracing</code></Link></td>
                <td>Add MLflow tracing to a scaffolded agent</td>
              </tr>
              <tr>
                <td><Link className="MdLink" href="/security/agent-sandboxing"><code className="MdCode">agent-sandboxing</code></Link></td>
                <td>Add a secure code sandbox with defense-in-depth isolation</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
