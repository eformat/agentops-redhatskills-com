import { QuickNav } from '@/components/QuickNav';
import Link from 'next/link';

const topics = [
  { title: 'Security', href: '/security', description: 'Secure agent communication, authentication, and authorization.' },
  { title: 'Tracing', href: '/tracing/connect-to-mlflow', description: 'Send agent traces from any framework to MLflow on OpenShift AI.' },
  { title: 'Evaluation', href: '/evaluation', description: 'Measure agent quality, correctness, and safety.' },
  { title: 'Identity', href: '/identity', description: 'Workload identity for agents using SPIRE, SPIFFE, and service accounts.' },
  { title: 'Observability', href: '/observability', description: 'Metrics, logs, and dashboards for agent operations.' },
  { title: 'Catalog', href: '/catalog', description: 'Discover, register, and version agents, tools, and prompts.' },
  { title: 'Lifecycle', href: '/lifecycle', description: 'Build, deploy, update, and retire agents on OpenShift.' },
];

export default function Home() {
  return (
    <>
      <QuickNav items={[]} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Red Hat AI AgentOps</h1>
        <p className="MdSubtitle">
          Connect any agent framework to the Red Hat OpenShift AI platform.
        </p>

        <p className="MdP">
          AgentOps is for agents and humans to connect any client framework into the
          Red Hat OpenShift AI Platform. We provide common code examples for frameworks
          that are built and tested against Red Hat OpenShift AI.
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
      </div>
    </>
  );
}
