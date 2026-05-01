import { highlight } from '@/utils/highlight';

export const quickNavItems = [
  { id: 'openshift-ai-setup', text: 'OpenShift AI Setup', level: 2 },
  { id: 'environment-variables', text: 'Environment variables', level: 3 },
  { id: 'authentication', text: 'Authentication', level: 3 },
  { id: 'gateway-rbac', text: 'Gateway RBAC', level: 3 },
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

const crewaiExample = `import os
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import mlflow
from crewai import Agent, Task, Crew, Process

# ── Connect to MLflow on OpenShift AI ──────────────────────────
_mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if _mlflow_uri:
    try:
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
            "MLFLOW_EXPERIMENT_NAME", "crewai-agent"
        )

        if _workspace:
            import mlflow.tracking.fluent as _fluent

            client = mlflow.MlflowClient()
            exps = client.search_experiments(
                filter_string=f"name = '{experiment_name}'"
            )
            if exps:
                _fluent._active_experiment_id = exps[0].experiment_id
            else:
                _fluent._active_experiment_id = client.create_experiment(
                    experiment_name
                )
        else:
            mlflow.set_experiment(experiment_name)

        mlflow.crewai.autolog()
        print(f"[mlflow] CrewAI tracing enabled → {_mlflow_uri}")
    except Exception as exc:
        print(f"[mlflow] Failed to initialise: {exc}")

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

const crewaiRequirements = `crewai>=0.121,<1.14
mlflow>=3.1`;

const autogenExample = `import os
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import mlflow
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

# ── Connect to MLflow on OpenShift AI ──────────────────────────
_mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if _mlflow_uri:
    try:
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
            "MLFLOW_EXPERIMENT_NAME", "autogen-agent"
        )

        if _workspace:
            import mlflow.tracking.fluent as _fluent

            client = mlflow.MlflowClient()
            exps = client.search_experiments(
                filter_string=f"name = '{experiment_name}'"
            )
            if exps:
                _fluent._active_experiment_id = exps[0].experiment_id
            else:
                _fluent._active_experiment_id = client.create_experiment(
                    experiment_name
                )
        else:
            mlflow.set_experiment(experiment_name)

        mlflow.autogen.autolog()
        print(f"[mlflow] AutoGen tracing enabled → {_mlflow_uri}")
    except Exception as exc:
        print(f"[mlflow] Failed to initialise: {exc}")

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

const llamaindexExample = `import os
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import mlflow
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI

# ── Connect to MLflow on OpenShift AI ──────────────────────────
_mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if _mlflow_uri:
    try:
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
            "MLFLOW_EXPERIMENT_NAME", "llamaindex-agent"
        )

        if _workspace:
            import mlflow.tracking.fluent as _fluent

            client = mlflow.MlflowClient()
            exps = client.search_experiments(
                filter_string=f"name = '{experiment_name}'"
            )
            if exps:
                _fluent._active_experiment_id = exps[0].experiment_id
            else:
                _fluent._active_experiment_id = client.create_experiment(
                    experiment_name
                )
        else:
            mlflow.set_experiment(experiment_name)

        mlflow.llama_index.autolog()
        print(f"[mlflow] LlamaIndex tracing enabled → {_mlflow_uri}")
    except Exception as exc:
        print(f"[mlflow] Failed to initialise: {exc}")

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

const adkExample = `import os
os.environ["MLFLOW_USE_DEFAULT_TRACER_PROVIDER"] = "false"
import mlflow
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# ── Connect to MLflow on OpenShift AI ──────────────────────────
mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "").strip()

if mlflow_uri:
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor

    _token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "")
    if _token_file and os.path.isfile(_token_file):
        with open(_token_file) as f:
            os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()

    mlflow.set_tracking_uri(mlflow_uri)

    # Workspace support (MLflow operator CR mode)
    _workspace = os.environ.get("MLFLOW_WORKSPACE", "").strip()
    if _workspace:
        mlflow.set_workspace(_workspace)

    experiment_name = os.environ.get(
        "MLFLOW_EXPERIMENT_NAME", "google-adk-agent"
    )

    if _workspace:
        import mlflow.tracking.fluent as _fluent

        client = mlflow.MlflowClient()
        exps = client.search_experiments(
            filter_string=f"name = '{experiment_name}'"
        )
        if exps:
            _exp_id = exps[0].experiment_id
        else:
            _exp_id = client.create_experiment(experiment_name)
        _fluent._active_experiment_id = _exp_id
    else:
        _exp_id = mlflow.set_experiment(experiment_name).experiment_id

    # ADK uses OpenTelemetry — configure OTLP exporter for MLflow
    _otel_endpoint = f"{mlflow_uri.rstrip('/')}/v1/traces"
    _otel_headers = {"x-mlflow-experiment-id": _exp_id}
    if _workspace:
        _otel_headers["x-mlflow-workspace"] = _workspace
    _token = os.environ.get("MLFLOW_TRACKING_TOKEN", "")
    if _token:
        _otel_headers["Authorization"] = f"Bearer {_token}"

    _tracer_provider = TracerProvider()
    _tracer_provider.add_span_processor(
        SimpleSpanProcessor(OTLPSpanExporter(
            endpoint=_otel_endpoint,
            headers=_otel_headers,
        ))
    )
    trace.set_tracer_provider(_tracer_provider)

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
mlflow>=3.6
opentelemetry-sdk
opentelemetry-exporter-otlp-proto-http`;

const envVarsCode = `# Required
MLFLOW_TRACKING_URI=http://mlflow:5500

# Optional
MLFLOW_EXPERIMENT_NAME=my-agent

# OpenShift AI / CR mode only
MLFLOW_WORKSPACE=my-namespace
MLFLOW_TRACKING_TOKEN_FILE=/var/run/secrets/kubernetes.io/serviceaccount/token
REQUESTS_CA_BUNDLE=/tmp/ca-bundle/combined-ca.crt`;

const tokenAuthCode = `_token_file = os.environ.get("MLFLOW_TRACKING_TOKEN_FILE", "").strip()
if _token_file and os.path.isfile(_token_file):
    with open(_token_file) as f:
        os.environ["MLFLOW_TRACKING_TOKEN"] = f.read().strip()`;

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

export const langgraphFiles = [
  { name: 'server.py', content: highlight(langgraphServer), language: 'python' },
  { name: 'graph.py', content: highlight(langgraphGraph), language: 'python' },
  { name: 'requirements.txt', content: highlight(langgraphRequirements), language: 'text' },
];

export const crewaiFiles = [
  { name: 'main.py', content: highlight(crewaiExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(crewaiRequirements), language: 'text' },
];

export const autogenFiles = [
  { name: 'main.py', content: highlight(autogenExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(autogenRequirements), language: 'text' },
];

export const llamaindexFiles = [
  { name: 'main.py', content: highlight(llamaindexExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(llamaindexRequirements), language: 'text' },
];

export const adkFiles = [
  { name: 'main.py', content: highlight(adkExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(adkRequirements), language: 'text' },
];

const gatewayRbacCode = `# Grant the pod's service account access to the MLflow operator gateway
oc create rolebinding agent-mlflow \\
  --clusterrole=mlflow-operator-mlflow-integration \\
  --serviceaccount=<namespace>:default \\
  -n <namespace>`;

export const gatewayRbacHighlighted = highlight(gatewayRbacCode);
export const envVarsHighlighted = highlight(envVarsCode);
export const tokenAuthHighlighted = highlight(tokenAuthCode);
export const valuesYamlHighlighted = highlight(valuesYaml);
export const deploymentYamlHighlighted = highlight(deploymentYaml);
export const initContainerYamlHighlighted = highlight(initContainerYaml);
