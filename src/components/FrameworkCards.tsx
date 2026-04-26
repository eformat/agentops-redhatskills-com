import './FrameworkCards.css';

interface FrameworkCard {
  name: string;
  description: string;
  href: string;
}

const frameworks: FrameworkCard[] = [
  {
    name: 'LangGraph',
    description: 'Stateful multi-actor agents with LangChain',
    href: '#langgraph',
  },
  {
    name: 'CrewAI',
    description: 'Role-based AI agent crew orchestration',
    href: '#crewai',
  },
  {
    name: 'AutoGen',
    description: 'Multi-agent conversations and collaboration',
    href: '#autogen',
  },
  {
    name: 'LlamaIndex',
    description: 'RAG pipelines and data-connected agents',
    href: '#llamaindex',
  },
  {
    name: 'Google ADK',
    description: 'Gemini-powered agents with built-in tool use',
    href: '#google-adk',
  },
];

export function FrameworkCards() {
  return (
    <div className="FrameworkCardsGrid">
      {frameworks.map((fw) => (
        <a key={fw.href} className="FrameworkCard" href={fw.href}>
          <div className="FrameworkCardBody">
            <span className="FrameworkCardName">{fw.name}</span>
            <span className="FrameworkCardDesc">{fw.description}</span>
          </div>
          <svg
            className="FrameworkCardArrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      ))}
    </div>
  );
}
