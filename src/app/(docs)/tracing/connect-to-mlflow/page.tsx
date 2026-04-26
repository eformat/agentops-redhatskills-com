import { Demo } from '@/components/Demo';
import { CodeBlock } from '@/components/CodeBlock';
import { QuickNav } from '@/components/QuickNav';
import { FrameworkCards } from '@/components/FrameworkCards';
import { highlight } from '@/utils/highlight';

const quickNavItems = [
  { id: 'openshift-ai-setup', text: 'OpenShift AI Setup', level: 2 },
  { id: 'environment-variables', text: 'Environment variables', level: 3 },
  { id: 'authentication', text: 'Authentication', level: 3 },
  { id: 'agent-frameworks', text: 'Agent Frameworks', level: 2 },
  { id: 'langgraph', text: 'LangGraph', level: 3 },
  { id: 'crewai', text: 'CrewAI', level: 3 },
  { id: 'autogen', text: 'AutoGen', level: 3 },
  { id: 'llamaindex', text: 'LlamaIndex', level: 3 },
  { id: 'google-adk', text: 'Google ADK', level: 3 },
  { id: 'openshift-deployment', text: 'OpenShift Deployment', level: 2 },
  { id: 'standalone-mode', text: 'Standalone mode', level: 3 },
  { id: 'cr-mode', text: 'CR mode (MLflow Operator)', level: 3 },
];

// ── LangGraph canonical example from bank-voice-agent ──

const langgraphServer = `import os
import mlflow
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, StateGraph

from src.graph import build_graph

# ── Optional MLflow tracing ──────────────────────────────────────
_mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()
_mlflow_enabled = False
_mlflow_experiment_id: str | None = None

if _mlflow_uri:
    try:
        # Token file auth (OpenShift AI / MLflow operator CR mode)
        _token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "").strip()
        if _token_file and os.path.isfile(_token_file):
            with open(_token_file) as f:
                os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()

        mlflow.set_tracking_uri(_mlflow_uri)

        # Workspace support (MLflow operator CR mode)
        _workspace = os.environ.get("MLFLOW_WORKSPACE", "").strip()
        if _workspace:
            mlflow.set_workspace(_workspace)

        experiment_name = os.environ.get(
            "MLFLOW_EXPERIMENT_NAME", "my-agent"
        )

        if _workspace:
            # MLflow operator gateway blocks get_experiment.
            # Use search_experiments to find or create.
            import mlflow.tracking.fluent as _fluent

            client = mlflow.MlflowClient()
            exps = client.search_experiments(
                filter_string=f"name = '{experiment_name}'"
            )
            if exps:
                _mlflow_experiment_id = exps[0].experiment_id
            else:
                _mlflow_experiment_id = client.create_experiment(
                    experiment_name
                )
            _fluent._active_experiment_id = _mlflow_experiment_id
        else:
            mlflow.set_experiment(experiment_name)

        mlflow.langchain.autolog()
        _mlflow_enabled = True
        print(f"[mlflow] Tracing enabled → {_mlflow_uri}")
    except Exception as exc:
        print(f"[mlflow] Failed to initialise: {exc}")`;

const langgraphGraph = `"""LangGraph graph construction."""

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, StateGraph
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


def build_graph():
    """Compile and return the LangGraph instance."""
    llm = ChatOpenAI(model="gpt-4o-mini")

    def agent_node(state: AgentState):
        response = llm.invoke(state["messages"])
        return {"messages": [response]}

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_edge(START, "agent")
    return graph.compile(checkpointer=MemorySaver())`;

const langgraphRequirements = `langgraph>=0.4
langchain-openai>=0.3
mlflow>=3.1`;

// ── CrewAI ──

const crewaiExample = `import os
import mlflow
from crewai import Agent, Task, Crew, Process

# ── Connect to MLflow on OpenShift AI ──────────────────────────
mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if mlflow_uri:
    _token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "")
    if _token_file and os.path.isfile(_token_file):
        with open(_token_file) as f:
            os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()

    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment(
        os.environ.get("MLFLOW_EXPERIMENT_NAME", "crewai-agent")
    )
    mlflow.crewai.autolog()
    print(f"[mlflow] CrewAI tracing enabled → {mlflow_uri}")

# ── Define agents and tasks ────────────────────────────────────
researcher = Agent(
    role="Researcher",
    goal="Find accurate information on the given topic",
    backstory="You are an expert research analyst.",
    verbose=True,
)

writer = Agent(
    role="Writer",
    goal="Write a clear summary based on the research",
    backstory="You are a technical writer.",
    verbose=True,
)

research_task = Task(
    description="Research the topic: {topic}",
    expected_output="A detailed summary of findings",
    agent=researcher,
)

write_task = Task(
    description="Write a report based on the research",
    expected_output="A well-structured report",
    agent=writer,
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,
    verbose=True,
)

# All CrewAI traces are automatically sent to MLflow
result = crew.kickoff(inputs={"topic": "AI agent observability"})`;

const crewaiRequirements = `crewai>=0.121
mlflow>=3.1`;

// ── AutoGen ──

const autogenExample = `import os
import mlflow
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

# ── Connect to MLflow on OpenShift AI ──────────────────────────
mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if mlflow_uri:
    _token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "")
    if _token_file and os.path.isfile(_token_file):
        with open(_token_file) as f:
            os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()

    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment(
        os.environ.get("MLFLOW_EXPERIMENT_NAME", "autogen-agent")
    )
    mlflow.autogen.autolog()
    print(f"[mlflow] AutoGen tracing enabled → {mlflow_uri}")

# ── Define agents ──────────────────────────────────────────────
model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

planner = AssistantAgent(
    name="planner",
    model_client=model_client,
    system_message="You are a planning agent. Break tasks into steps.",
)

executor = AssistantAgent(
    name="executor",
    model_client=model_client,
    system_message="You execute the plan. Say TERMINATE when done.",
)

termination = TextMentionTermination("TERMINATE")

team = RoundRobinGroupChat(
    participants=[planner, executor],
    termination_condition=termination,
    max_turns=6,
)

# All AutoGen traces are automatically sent to MLflow
import asyncio
result = asyncio.run(
    team.run(task="Summarize best practices for agent tracing")
)`;

const autogenRequirements = `autogen-agentchat>=0.4
autogen-ext[openai]>=0.4
mlflow>=3.1`;

// ── LlamaIndex ──

const llamaindexExample = `import os
import mlflow
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI

# ── Connect to MLflow on OpenShift AI ──────────────────────────
mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if mlflow_uri:
    _token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "")
    if _token_file and os.path.isfile(_token_file):
        with open(_token_file) as f:
            os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()

    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment(
        os.environ.get("MLFLOW_EXPERIMENT_NAME", "llamaindex-agent")
    )
    mlflow.llama_index.autolog()
    print(f"[mlflow] LlamaIndex tracing enabled → {mlflow_uri}")

# ── Build a RAG pipeline ──────────────────────────────────────
Settings.llm = OpenAI(model="gpt-4o-mini")

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

# All LlamaIndex traces are automatically sent to MLflow
response = query_engine.query(
    "What are the key concepts in agent tracing?"
)
print(response)`;

const llamaindexRequirements = `llama-index>=0.12
llama-index-llms-openai>=0.4
mlflow>=3.1`;

// ── Google ADK ──

const adkExample = `import os
import mlflow
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# ── Connect to MLflow on OpenShift AI ──────────────────────────
mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if mlflow_uri:
    _token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "")
    if _token_file and os.path.isfile(_token_file):
        with open(_token_file) as f:
            os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()

    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment(
        os.environ.get("MLFLOW_EXPERIMENT_NAME", "google-adk-agent")
    )
    # ADK uses OpenTelemetry — export spans to MLflow
    os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = mlflow_uri
    os.environ["OTEL_EXPORTER_OTLP_PROTOCOL"] = "http/protobuf"
    print(f"[mlflow] Google ADK tracing enabled → {mlflow_uri}")

# ── Define an ADK agent ───────────────────────────────────────
def get_weather(city: str) -> dict:
    """Get current weather for a city."""
    return {
        "city": city,
        "temperature": "72°F",
        "condition": "Sunny",
    }

agent = Agent(
    name="weather_agent",
    model="gemini-2.0-flash",
    description="A helpful weather assistant",
    instruction="Help users check the weather. Use the get_weather "
                "tool when they ask about weather in a specific city.",
    tools=[get_weather],
)

# ── Run the agent ─────────────────────────────────────────────
session_service = InMemorySessionService()
runner = Runner(agent=agent, app_name="weather_app",
                session_service=session_service)

session = session_service.create_session(
    app_name="weather_app", user_id="user1"
)

message = types.Content(
    role="user",
    parts=[types.Part(text="What's the weather in San Francisco?")],
)

import asyncio

async def run():
    async for event in runner.run_async(
        user_id="user1", session_id=session.id, new_message=message
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)

asyncio.run(run())`;

const adkRequirements = `google-adk>=1.2
mlflow>=3.1`;

// ── OpenShift deployment config ──

const envVarsCode = `# Required
MLFLOW_TRACKING_URI=http://mlflow:5500

# Optional
MLFLOW_EXPERIMENT_NAME=my-agent

# OpenShift AI / CR mode only
MLFLOW_WORKSPACE=my-namespace
MLFLOW_TRACKING_TOKEN_FILE=/var/run/secrets/kubernetes.io/serviceaccount/token
REQUESTS_CA_BUNDLE=/tmp/ca-bundle/combined-ca.crt`;

const deploymentYaml = `# backend-deployment.yaml (Helm template excerpt)
containers:
  - name: backend
    env:
      {{- if eq (.Values.mlflow.deployMode | default "standalone") "cr" }}
      - name: MLFLOW_TRACKING_URI
        value: {{ .Values.mlflow.crServiceUrl | default
          "https://mlflow.redhat-ods-applications.svc.cluster.local:8443" }}
      - name: MLFLOW_WORKSPACE
        value: {{ .Release.Namespace | quote }}
      - name: REQUESTS_CA_BUNDLE
        value: "/tmp/ca-bundle/combined-ca.crt"
      - name: MLFLOW_TRACKING_TOKEN_FILE
        value: "/var/run/secrets/kubernetes.io/serviceaccount/token"
      {{- else }}
      - name: MLFLOW_TRACKING_URI
        value: {{ printf "http://%s-mlflow:%v"
          (include "app.fullname" $) .Values.mlflow.port }}
      {{- end }}
      - name: MLFLOW_EXPERIMENT_NAME
        value: {{ .Values.mlflow.experimentName | default "my-agent" }}`;

const valuesYaml = `mlflow:
  enabled: true
  # "standalone" deploys MLflow as Deployment+Service+PVC
  # "cr" uses the MLflow operator custom resource
  deployMode: "standalone"
  crServiceUrl: "https://mlflow.redhat-ods-applications.svc.cluster.local:8443"
  image:
    repository: ghcr.io/mlflow/mlflow
    tag: v3.10.1
  port: 5500
  args:
    - "mlflow"
    - "server"
    - "--host"
    - "0.0.0.0"
    - "--port"
    - "5500"
    - "--backend-store-uri"
    - "sqlite:////mlflow/mlflow.db"
    - "--default-artifact-root"
    - "/mlflow/mlartifacts"
  persistence:
    size: 5Gi`;

const initContainerYaml = `# Merge CA certificates for TLS to MLflow operator gateway
initContainers:
  - name: merge-ca
    image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
    command: ["/bin/sh", "-c"]
    args:
      - |
        cat /etc/pki/tls/certs/ca-bundle.crt \\
          > /tmp/ca-bundle/combined-ca.crt
        if [ -f /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt ]; then
          cat /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt \\
            >> /tmp/ca-bundle/combined-ca.crt
        fi
    volumeMounts:
      - name: ca-bundle
        mountPath: /tmp/ca-bundle`;

export default function ConnectToMlflowPage() {
  const langgraphFiles = [
    { name: 'server.py', content: highlight(langgraphServer), language: 'python' },
    { name: 'graph.py', content: highlight(langgraphGraph), language: 'python' },
    { name: 'requirements.txt', content: highlight(langgraphRequirements), language: 'text' },
  ];

  const crewaiFiles = [
    { name: 'main.py', content: highlight(crewaiExample), language: 'python' },
    { name: 'requirements.txt', content: highlight(crewaiRequirements), language: 'text' },
  ];

  const autogenFiles = [
    { name: 'main.py', content: highlight(autogenExample), language: 'python' },
    { name: 'requirements.txt', content: highlight(autogenRequirements), language: 'text' },
  ];

  const llamaindexFiles = [
    { name: 'main.py', content: highlight(llamaindexExample), language: 'python' },
    { name: 'requirements.txt', content: highlight(llamaindexRequirements), language: 'text' },
  ];

  const adkFiles = [
    { name: 'main.py', content: highlight(adkExample), language: 'python' },
    { name: 'requirements.txt', content: highlight(adkRequirements), language: 'text' },
  ];

  return (
    <>
      <QuickNav items={quickNavItems} />
      <div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
        <h1 className="MdH1">Connect to MLFlow</h1>
        <p className="MdSubtitle">
          Send agent traces from any framework to MLflow on Red Hat OpenShift AI.
        </p>

        <p className="MdP">
          MLflow tracing captures every LLM call, tool invocation, and agent state transition
          as structured spans. On OpenShift AI, MLflow runs as a managed service that your agent
          connects to via environment variables — no code changes needed when moving between
          standalone and operator-managed deployments.
        </p>

        <p className="MdP">
          The pattern is the same across all frameworks: read the tracking URI from the environment,
          optionally authenticate with a service account token, and call the framework&apos;s{' '}
          <code className="MdCode">autolog()</code> function. Every trace is then automatically
          collected, including LLM inputs/outputs, latency, token counts, and tool results.
        </p>

        <FrameworkCards />

        {/* ── OpenShift AI Setup ── */}

        <h2 className="MdH2" id="openshift-ai-setup">OpenShift AI Setup</h2>

        <p className="MdP">
          MLflow on OpenShift AI supports two deployment modes:{' '}
          <strong className="MdStrong">standalone</strong> (a Deployment + Service + PVC managed by
          your Helm chart) and <strong className="MdStrong">CR mode</strong> (an MLflow custom
          resource managed by the MLflow operator). Both expose the same tracking API — only the
          connection details differ.
        </p>

        <h3 className="MdH3" id="environment-variables">Environment variables</h3>

        <p className="MdP">
          Your agent reads these environment variables at startup. In standalone mode, only{' '}
          <code className="MdCode">MLFLOW_TRACKING_URI</code> is required. In CR mode, the
          workspace and token file are also needed.
        </p>

        <CodeBlock title="Environment variables">{highlight(envVarsCode)}</CodeBlock>

        <div className="ApiTable">
          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code className="MdCode">MLFLOW_TRACKING_URI</code></td>
                <td>Yes</td>
                <td>MLflow server URL. Set automatically by the Helm chart.</td>
              </tr>
              <tr>
                <td><code className="MdCode">MLFLOW_EXPERIMENT_NAME</code></td>
                <td>No</td>
                <td>Experiment name. Defaults to the agent name.</td>
              </tr>
              <tr>
                <td><code className="MdCode">MLFLOW_WORKSPACE</code></td>
                <td>CR only</td>
                <td>Namespace for multi-tenant isolation via the operator gateway.</td>
              </tr>
              <tr>
                <td><code className="MdCode">MLFLOW_TRACKING_TOKEN_FILE</code></td>
                <td>CR only</td>
                <td>Path to the service account token for gateway authentication.</td>
              </tr>
              <tr>
                <td><code className="MdCode">REQUESTS_CA_BUNDLE</code></td>
                <td>CR only</td>
                <td>CA bundle for TLS to the operator-managed MLflow gateway.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="MdH3" id="authentication">Authentication</h3>

        <p className="MdP">
          In CR mode, the agent authenticates to the MLflow operator gateway using a Kubernetes
          service account token. The token is mounted at the standard path and read at startup:
        </p>

        <CodeBlock title="Token file authentication">{highlight(
`_token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "").strip()
if _token_file and os.path.isfile(_token_file):
    with open(_token_file) as f:
        os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()`)}</CodeBlock>

        <p className="MdP">
          The operator gateway also requires a merged CA bundle (system CAs + Kubernetes service CA)
          for TLS verification. This is handled by an init container in the deployment.
        </p>

        {/* ── Agent Frameworks ── */}

        <h2 className="MdH2" id="agent-frameworks">Agent Frameworks</h2>

        {/* ── LangGraph ── */}

        <h3 className="MdH3" id="langgraph">LangGraph</h3>

        <p className="MdP">
          <a className="MdLink" href="https://langchain-ai.github.io/langgraph/">LangGraph</a>{' '}
          is the most common framework for building stateful, multi-actor agent applications.
          MLflow&apos;s <code className="MdCode">mlflow.langchain.autolog()</code> automatically
          traces all LangChain and LangGraph components — LLM calls, tool executions, graph node
          transitions, and state checkpoints.
        </p>

        <p className="MdP">
          This example is from the{' '}
          <a className="MdLink" href="https://github.com/redhat-et/bank-voice-agent">
            bank-voice-agent
          </a>{' '}
          reference architecture, which runs a multi-agent banking assistant on OpenShift AI
          with full MLflow observability.
        </p>

        <Demo files={langgraphFiles} defaultCollapsed={false}>
          <div className="DemoPreviewText">
            <strong className="MdStrong">mlflow.langchain.autolog()</strong>
            <span> — Traces LLM calls, tool use, and graph state transitions</span>
          </div>
        </Demo>

        <p className="MdP">
          With <code className="MdCode">autolog()</code> enabled, every call to{' '}
          <code className="MdCode">graph.invoke()</code> or{' '}
          <code className="MdCode">graph.stream()</code> produces a trace with spans for each node,
          LLM invocation, and tool call. No manual callbacks are needed.
        </p>

        {/* ── CrewAI ── */}

        <h3 className="MdH3" id="crewai">CrewAI</h3>

        <p className="MdP">
          <a className="MdLink" href="https://www.crewai.com/">CrewAI</a>{' '}
          orchestrates role-based AI agents working together as a crew.
          MLflow&apos;s <code className="MdCode">mlflow.crewai.autolog()</code> captures
          each agent&apos;s task execution, tool calls, and crew-level orchestration.
        </p>

        <Demo files={crewaiFiles} defaultCollapsed={false}>
          <div className="DemoPreviewText">
            <strong className="MdStrong">mlflow.crewai.autolog()</strong>
            <span> — Traces crew orchestration, agent tasks, and tool calls</span>
          </div>
        </Demo>

        {/* ── AutoGen ── */}

        <h3 className="MdH3" id="autogen">AutoGen</h3>

        <p className="MdP">
          <a className="MdLink" href="https://microsoft.github.io/autogen/">AutoGen</a>{' '}
          enables multi-agent conversations where agents collaborate, debate, and solve problems
          together. MLflow&apos;s <code className="MdCode">mlflow.autogen.autolog()</code> traces
          each agent turn, message exchange, and termination condition.
        </p>

        <Demo files={autogenFiles} defaultCollapsed={false}>
          <div className="DemoPreviewText">
            <strong className="MdStrong">mlflow.autogen.autolog()</strong>
            <span> — Traces agent conversations, turns, and group chat flow</span>
          </div>
        </Demo>

        {/* ── LlamaIndex ── */}

        <h3 className="MdH3" id="llamaindex">LlamaIndex</h3>

        <p className="MdP">
          <a className="MdLink" href="https://www.llamaindex.ai/">LlamaIndex</a>{' '}
          specializes in RAG pipelines and data-connected agents.
          MLflow&apos;s <code className="MdCode">mlflow.llama_index.autolog()</code> captures
          document loading, embedding, retrieval, and query engine execution.
        </p>

        <Demo files={llamaindexFiles} defaultCollapsed={false}>
          <div className="DemoPreviewText">
            <strong className="MdStrong">mlflow.llama_index.autolog()</strong>
            <span> — Traces RAG retrieval, embedding, and query execution</span>
          </div>
        </Demo>

        {/* ── Google ADK ── */}

        <h3 className="MdH3" id="google-adk">Google ADK</h3>

        <p className="MdP">
          <a className="MdLink" href="https://google.github.io/adk-docs/">Google Agent Development Kit (ADK)</a>{' '}
          builds agents using Gemini models with built-in tool use. ADK uses OpenTelemetry
          natively — traces can be exported to MLflow&apos;s OTLP endpoint or via the{' '}
          <code className="MdCode">mlflow.tracing</code> API.
        </p>

        <Demo files={adkFiles} defaultCollapsed={false}>
          <div className="DemoPreviewText">
            <strong className="MdStrong">OpenTelemetry export</strong>
            <span> — Traces agent runs, tool calls, and Gemini model interactions</span>
          </div>
        </Demo>

        {/* ── OpenShift Deployment ── */}

        <h2 className="MdH2" id="openshift-deployment">OpenShift Deployment</h2>

        <p className="MdP">
          The Helm chart handles MLflow deployment and injects the correct environment variables
          into your agent&apos;s pod. The configuration differs between standalone and CR mode.
        </p>

        <h3 className="MdH3" id="standalone-mode">Standalone mode</h3>

        <p className="MdP">
          Deploys MLflow as a Deployment + Service + PVC in your namespace. The agent connects
          directly via HTTP. This is the simplest setup and works on any OpenShift cluster.
        </p>

        <CodeBlock title="values.yaml">{highlight(valuesYaml)}</CodeBlock>

        <h3 className="MdH3" id="cr-mode">CR mode (MLflow Operator)</h3>

        <p className="MdP">
          Uses the MLflow operator to manage MLflow as a custom resource. The operator provides
          a gateway that handles multi-tenant workspace isolation and service account
          authentication. An init container merges CA certificates for TLS.
        </p>

        <CodeBlock title="backend-deployment.yaml">{highlight(deploymentYaml)}</CodeBlock>

        <CodeBlock title="Init container — CA bundle merge">{highlight(initContainerYaml)}</CodeBlock>
      </div>
    </>
  );
}
