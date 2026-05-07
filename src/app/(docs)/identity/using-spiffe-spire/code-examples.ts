import { highlight } from '@/utils/highlight';

export const quickNavItems = [
  { id: 'spiffe-spire-concepts', text: 'SPIFFE/SPIRE Concepts', level: 2 },
  { id: 'identity-format', text: 'Identity format', level: 3 },
  { id: 'svid-types', text: 'SVID types', level: 3 },
  { id: 'agent-frameworks', text: 'Agent Frameworks', level: 2 },
  { id: 'langgraph', text: 'LangGraph', level: 3 },
  { id: 'crewai', text: 'CrewAI', level: 3 },
  { id: 'autogen', text: 'AutoGen', level: 3 },
  { id: 'llamaindex', text: 'LlamaIndex', level: 3 },
  { id: 'google-adk', text: 'Google ADK', level: 3 },
  { id: 'openshift-deployment', text: 'OpenShift Deployment', level: 2 },
  { id: 'installing-kagenti', text: 'Installing kagenti', level: 3 },
  { id: 'kagenti-labels-and-annotations', text: 'Kagenti labels and annotations', level: 3 },
  { id: 'helm-chart-configuration', text: 'Helm chart configuration', level: 3 },
  { id: 'kubernetes-manifests', text: 'Kubernetes manifests', level: 3 },
  { id: 'authbridge', text: 'AuthBridge', level: 2 },
  { id: 'outbound-route-configuration', text: 'Outbound route configuration', level: 3 },
  { id: 'token-exchange', text: 'Token exchange', level: 3 },
  { id: 'verifying-identity', text: 'Verifying Identity', level: 2 },
];

// ── SPIFFE identity format ──────────────────────────────────────────────────

const spiffeFormatCode = `# SPIFFE identity format
spiffe://{trust-domain}/ns/{namespace}/sa/{service-account}

# Examples
spiffe://localtest.me/ns/team1/sa/weather-service
spiffe://localtest.me/ns/team1/sa/slack-researcher
spiffe://apps.cluster.example.com/ns/team1/sa/bank-agent-backend`;

const jwtSvidCode = `# JWT SVID payload (decoded)
{
  "sub": "spiffe://localtest.me/ns/team1/sa/weather-service",
  "aud": "kagenti",
  "exp": 1735689600,
  "iat": 1735686000,
  "iss": "https://spire-server.spire.svc.cluster.local:8443"
}`;

// ── LangGraph SPIRE integration ─────────────────────────────────────────────

const langgraphSpireLoader = `import os
import json

# ── SPIRE identity (read once at startup) ─────────────────────
_spire_identity: dict[str, str] = {}
_SVID_DIR = os.environ.get("SPIFFE_SVID_DIR", "/spiffe")
_JWT_SVID_PATH = os.path.join(_SVID_DIR, "jwt_svid.token")
_X509_SVID_PATH = os.path.join(_SVID_DIR, "svid.pem")

def _load_spire_identity() -> dict[str, str]:
    """Read SPIRE SVID files and extract identity claims."""
    identity: dict[str, str] = {}
    try:
        if os.path.isfile(_JWT_SVID_PATH):
            with open(_JWT_SVID_PATH) as f:
                jwt_token = f.read().strip()
            # Decode payload without verification (local file, trusted)
            parts = jwt_token.split(".")
            if len(parts) >= 2:
                import base64 as _b64
                padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
                payload = json.loads(_b64.urlsafe_b64decode(padded))
                identity["spiffe.id"] = payload.get("sub", "")
                identity["spiffe.audience"] = str(payload.get("aud", ""))
                identity["spiffe.issuer"] = payload.get("iss", "")
                identity["spiffe.expiry"] = str(payload.get("exp", ""))
            identity["spiffe.jwt_svid"] = jwt_token[:80] + "..."
    except Exception as exc:
        print(f"[spire] Failed to read JWT SVID: {exc}", flush=True)
    try:
        if os.path.isfile(_X509_SVID_PATH):
            with open(_X509_SVID_PATH) as f:
                cert_pem = f.read().strip()
            identity["spiffe.x509_svid"] = cert_pem[:120] + "..."
    except Exception as exc:
        print(f"[spire] Failed to read X.509 SVID: {exc}", flush=True)
    return identity

_spire_identity = _load_spire_identity()
if _spire_identity:
    print(f"[spire] Identity loaded: "
          f"{_spire_identity.get('spiffe.id', 'unknown')}", flush=True)`;

const langgraphMlflowTags = `import mlflow

def _tag_mlflow_trace(result: dict) -> None:
    """Attach SPIRE identity as trace-level tags in MLflow."""
    if not _mlflow_enabled or not _spire_identity:
        return
    try:
        client = mlflow.MlflowClient()
        traces = client.search_traces(
            experiment_ids=[_mlflow_experiment_id],
            max_results=1,
        )
        if traces:
            request_id = traces[0].info.request_id
            for key, value in _spire_identity.items():
                client.set_trace_tag(request_id, key, value)
    except Exception as exc:
        print(f"[mlflow] Failed to tag trace: {exc}", flush=True)`;

const langgraphRequirements = `langgraph>=0.4
langchain-openai>=0.3
mlflow>=3.1`;

// ── CrewAI SPIRE integration ────────────────────────────────────────────────

const crewaiSpireExample = `import os
import json
from crewai import Agent, Task, Crew, Process

# ── Load SPIRE identity ──────────────────────────────────────
def _load_spire_identity() -> dict[str, str]:
    svid_dir = os.environ.get("SPIFFE_SVID_DIR", "/spiffe")
    jwt_path = os.path.join(svid_dir, "jwt_svid.token")
    identity = {}
    if os.path.isfile(jwt_path):
        with open(jwt_path) as f:
            token = f.read().strip()
        parts = token.split(".")
        if len(parts) >= 2:
            import base64
            padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded))
            identity["spiffe.id"] = payload.get("sub", "")
            identity["spiffe.audience"] = str(payload.get("aud", ""))
    return identity

spire_identity = _load_spire_identity()
if spire_identity:
    print(f"[spire] CrewAI agent identity: {spire_identity.get('spiffe.id')}")

# ── Define agents and tasks ──────────────────────────────────
researcher = Agent(
    role="Researcher",
    goal="Find accurate information on the given topic",
    backstory="You are an expert research analyst.",
    verbose=True,
)

crew = Crew(
    agents=[researcher],
    tasks=[Task(
        description="Research {topic}",
        expected_output="A summary of findings",
        agent=researcher,
    )],
    process=Process.sequential,
)

result = crew.kickoff(inputs={"topic": "zero-trust agent identity"})`;

const crewaiRequirements = `crewai>=0.121
mlflow>=3.1`;

// ── AutoGen SPIRE integration ───────────────────────────────────────────────

const autogenSpireExample = `import os
import json
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

# ── Load SPIRE identity ──────────────────────────────────────
def _load_spire_identity() -> dict[str, str]:
    svid_dir = os.environ.get("SPIFFE_SVID_DIR", "/spiffe")
    jwt_path = os.path.join(svid_dir, "jwt_svid.token")
    identity = {}
    if os.path.isfile(jwt_path):
        with open(jwt_path) as f:
            token = f.read().strip()
        parts = token.split(".")
        if len(parts) >= 2:
            import base64
            padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded))
            identity["spiffe.id"] = payload.get("sub", "")
            identity["spiffe.audience"] = str(payload.get("aud", ""))
    return identity

spire_identity = _load_spire_identity()
if spire_identity:
    print(f"[spire] AutoGen agent identity: {spire_identity.get('spiffe.id')}")

# ── Define agents ─────────────────────────────────────────────
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

team = RoundRobinGroupChat(
    participants=[planner, executor],
    termination_condition=TextMentionTermination("TERMINATE"),
    max_turns=6,
)

import asyncio
result = asyncio.run(
    team.run(task="Explain SPIFFE workload identity for AI agents")
)`;

const autogenRequirements = `autogen-agentchat>=0.4
autogen-ext[openai]>=0.4
mlflow>=3.1`;

// ── LlamaIndex SPIRE integration ────────────────────────────────────────────

const llamaindexSpireExample = `import os
import json
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI

# ── Load SPIRE identity ──────────────────────────────────────
def _load_spire_identity() -> dict[str, str]:
    svid_dir = os.environ.get("SPIFFE_SVID_DIR", "/spiffe")
    jwt_path = os.path.join(svid_dir, "jwt_svid.token")
    identity = {}
    if os.path.isfile(jwt_path):
        with open(jwt_path) as f:
            token = f.read().strip()
        parts = token.split(".")
        if len(parts) >= 2:
            import base64
            padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded))
            identity["spiffe.id"] = payload.get("sub", "")
            identity["spiffe.audience"] = str(payload.get("aud", ""))
    return identity

spire_identity = _load_spire_identity()
if spire_identity:
    print(f"[spire] LlamaIndex agent identity: {spire_identity.get('spiffe.id')}")

# ── Build a RAG pipeline ─────────────────────────────────────
Settings.llm = OpenAI(model="gpt-4o-mini")

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

response = query_engine.query(
    "What are the key concepts in SPIFFE workload identity?"
)
print(response)`;

const llamaindexRequirements = `llama-index>=0.12
llama-index-llms-openai>=0.4
mlflow>=3.1`;

// ── Google ADK SPIRE integration ────────────────────────────────────────────

const adkSpireExample = `import os
import json
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# ── Load SPIRE identity ──────────────────────────────────────
def _load_spire_identity() -> dict[str, str]:
    svid_dir = os.environ.get("SPIFFE_SVID_DIR", "/spiffe")
    jwt_path = os.path.join(svid_dir, "jwt_svid.token")
    identity = {}
    if os.path.isfile(jwt_path):
        with open(jwt_path) as f:
            token = f.read().strip()
        parts = token.split(".")
        if len(parts) >= 2:
            import base64
            padded = parts[1] + "=" * (4 - len(parts[1]) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded))
            identity["spiffe.id"] = payload.get("sub", "")
            identity["spiffe.audience"] = str(payload.get("aud", ""))
    return identity

spire_identity = _load_spire_identity()
if spire_identity:
    print(f"[spire] ADK agent identity: {spire_identity.get('spiffe.id')}")

# ── Define an ADK agent ──────────────────────────────────────
def check_identity() -> dict:
    """Return the agent's SPIFFE workload identity."""
    return spire_identity or {"error": "No SPIRE identity available"}

agent = Agent(
    name="identity_agent",
    model="gemini-2.0-flash",
    description="An agent that can inspect its own workload identity",
    instruction="Help users understand SPIFFE workload identity. "
                "Use the check_identity tool to show the agent's identity.",
    tools=[check_identity],
)

session_service = InMemorySessionService()
runner = Runner(agent=agent, app_name="identity_app",
                session_service=session_service)

session = session_service.create_session(
    app_name="identity_app", user_id="user1"
)

message = types.Content(
    role="user",
    parts=[types.Part(text="What is your workload identity?")],
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

// ── Helm / Kubernetes deployment snippets ───────────────────────────────────

const valuesYamlCode = `kagenti:
  enabled: true
  a2aPort: 8080
  authbridge:
    # Target audience for outbound token exchange (catch-all route)
    targetAudience: "echo-service"
    # Token scopes for outbound token exchange
    tokenScopes: "openid"`;

const deploymentLabelsCode = `# Deployment metadata labels
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-agent-backend
  labels:
    kagenti.io/type: "agent"
    kagenti.io/framework: "LangGraph"
    kagenti.io/workload-type: "deployment"
    protocol.kagenti.io/a2a: ""
spec:
  template:
    metadata:
      labels:
        # Enables webhook sidecar injection
        kagenti.io/inject: "enabled"
        kagenti.io/spire: "enabled"
        kagenti.io/type: "agent"
        kagenti.io/client-registration-inject: "true"
        protocol.kagenti.io/a2a: ""
        istio.io/dataplane-mode: "none"
      annotations:
        # Exclude WebSocket port from Envoy interception
        kagenti.io/inbound-ports-exclude: "8765"`;

const serviceAccountCode = `# ServiceAccount for SPIRE workload identity
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-agent-backend
  namespace: team1`;

const svidVolumeMountCode = `# SVID volume mount in deployment spec
spec:
  containers:
    - name: backend
      env:
        - name: KAGENTI_ENABLED
          value: "true"
      volumeMounts:
        - name: svid-output
          mountPath: /spiffe
          readOnly: true
      ports:
        - name: a2a
          containerPort: 8080
          protocol: TCP
  # spiffe-helper writes SVIDs to this emptyDir
  volumes:
    - name: svid-output
      emptyDir: {}`;

const k8sManifestCode = `# Standalone Kubernetes manifest (without Helm)
apiVersion: v1
kind: ServiceAccount
metadata:
  name: weather-service
  namespace: team1
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: weather-service
    kagenti.io/type: agent
    protocol.kagenti.io/a2a: ""
  name: weather-service
  namespace: team1
spec:
  ports:
  - name: http
    port: 8080
    targetPort: 8000
  selector:
    app.kubernetes.io/name: weather-service
    kagenti.io/type: agent
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/name: weather-service
    kagenti.io/framework: LangGraph
    kagenti.io/type: agent
    kagenti.io/workload-type: deployment
    protocol.kagenti.io/a2a: ""
  name: weather-service
  namespace: team1
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: weather-service
      kagenti.io/type: agent
  template:
    metadata:
      labels:
        app.kubernetes.io/name: weather-service
        kagenti.io/framework: LangGraph
        kagenti.io/type: agent
        protocol.kagenti.io/a2a: ""
    spec:
      serviceAccountName: weather-service
      containers:
      - name: agent
        image: ghcr.io/kagenti/agent-examples/weather_service:latest
        ports:
        - containerPort: 8000
          name: http
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop: [ALL]
          runAsUser: 1000
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault`;

// ── AuthBridge ──────────────────────────────────────────────────────────────

const authproxyRoutesCode = `# AuthBridge outbound route configuration (ConfigMap)
apiVersion: v1
kind: ConfigMap
metadata:
  name: authproxy-routes
data:
  routes.yaml: |
    # First-match-wins routing
    # "*" does NOT match dots; use "**" for multi-segment hostnames

    # Cloud metadata service — passthrough
    - host: "169.254.169.254"
      passthrough: true

    # Kubernetes API server — passthrough
    - host: "kubernetes*"
      passthrough: true
    - host: "10.96.0.1"
      passthrough: true

    # Internal services that don't need AuthBridge tokens
    - host: "maas.**"
      passthrough: true
    - host: "**-predictor-**"
      passthrough: true

    # Catch-all: exchange tokens for all other destinations
    - host: "**"
      target_audience: "echo-service"
      token_scopes: "openid"`;

const tokenExchangeCode = `import requests
import jwt

def exchange_token_for_tool(user_token: str, tool_audience: str) -> str:
    """Exchange user token for tool-scoped token using SPIFFE identity."""

    # Read SPIFFE JWT SVID
    with open("/spiffe/jwt_svid.token", "r") as f:
        jwt_svid = f.read().strip()

    # Extract client ID from SVID
    payload = jwt.decode(jwt_svid, options={"verify_signature": False})
    client_id = payload["sub"]

    # RFC 8693 token exchange request
    response = requests.post(
        "http://keycloak.keycloak.svc.cluster.local:8080"
        "/realms/master/protocol/openid-connect/token",
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "subject_token": user_token,
            "subject_token_type":
                "urn:ietf:params:oauth:token-type:access_token",
            "audience": tool_audience,
            "client_id": client_id,
        },
        headers={
            "Authorization": f"Bearer {jwt_svid}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    if response.status_code != 200:
        raise Exception(f"Token exchange failed: {response.text}")

    return response.json()["access_token"]

# Usage: exchange user token for a tool-scoped token
user_token = request.headers.get("Authorization", "").replace("Bearer ", "")
tool_token = exchange_token_for_tool(user_token, "slack-tool")

tool_response = requests.post(
    "http://slack-tool.team1.svc.cluster.local:8000/mcp",
    headers={"Authorization": f"Bearer {tool_token}"},
    json={"method": "tools/list"},
)`;

// ── Verify identity tool ────────────────────────────────────────────────────

const checkIdentityCode = `import os
import requests
from langchain_core.tools import tool

ECHO_SERVICE_URL = os.getenv("ECHO_SERVICE_URL", "")

@tool
def check_identity() -> dict:
    """Check the workload identity of this agent by calling the echo service.

    Returns the decoded JWT token claims that AuthBridge attaches to outbound
    requests, including sub, azp (authorized party), client_id, issuer, scope,
    and groups. This shows the zero-trust identity exchange in action.
    """
    if not ECHO_SERVICE_URL:
        return {"error": "ECHO_SERVICE_URL not configured"}
    try:
        resp = requests.get(f"{ECHO_SERVICE_URL}/identity", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        token = data.get("token", {})
        if token.get("error"):
            return {"error": token["error"],
                    "detail": "AuthBridge may not be configured"}
        return {
            "azp": token.get("azp"),
            "client_id": token.get("client_id"),
            "sub": token.get("sub"),
            "iss": token.get("iss"),
            "scope": token.get("scope"),
            "groups": token.get("groups"),
            "preferred_username": token.get("preferred_username"),
        }
    except Exception as e:
        return {"error": str(e)}`;

const validateSvidCode = `# Validate SPIRE SVIDs on a running pod
kubectl exec -n team1 deployment/my-agent -- ls -la /spiffe/
# Expected: svid.pem  svid_key.pem  svid_bundle.pem  jwt_svid.token

# Decode JWT SVID to inspect claims
kubectl exec -n team1 deployment/my-agent -- \\
  cat /spiffe/jwt_svid.token | cut -d'.' -f2 | base64 -d | jq .

# Check SPIRE workload registration
kubectl exec -n spire deployment/spire-server -- \\
  /opt/spire/bin/spire-server entry show`;

// ── Exports ─────────────────────────────────────────────────────────────────

export const langgraphFiles = [
  { name: 'spire_identity.py', content: highlight(langgraphSpireLoader), language: 'python' },
  { name: 'mlflow_tags.py', content: highlight(langgraphMlflowTags), language: 'python' },
  { name: 'requirements.txt', content: highlight(langgraphRequirements), language: 'text' },
];

export const crewaiFiles = [
  { name: 'main.py', content: highlight(crewaiSpireExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(crewaiRequirements), language: 'text' },
];

export const autogenFiles = [
  { name: 'main.py', content: highlight(autogenSpireExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(autogenRequirements), language: 'text' },
];

export const llamaindexFiles = [
  { name: 'main.py', content: highlight(llamaindexSpireExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(llamaindexRequirements), language: 'text' },
];

export const adkFiles = [
  { name: 'main.py', content: highlight(adkSpireExample), language: 'python' },
  { name: 'requirements.txt', content: highlight(adkRequirements), language: 'text' },
];

export const spiffeFormatHighlighted = highlight(spiffeFormatCode);
const kagentiSetupCode = `# Clone the kagenti repo (if not already present)
git clone https://github.com/kagenti/kagenti.git ~/git/kagenti

# Run the platform setup (requires cluster-admin and helm >= 3.18.0)
cd ~/git/kagenti
./scripts/ocp/setup-kagenti.sh`;

const kagentiSetupOptionsCode = `# Use a local clone instead of auto-cloning from upstream
./scripts/ocp/setup-kagenti.sh --kagenti-repo ~/git/kagenti

# Custom Keycloak realm (default: kagenti)
./scripts/ocp/setup-kagenti.sh --realm nerc

# Skip MLflow integration
./scripts/ocp/setup-kagenti.sh --skip-mlflow

# Skip MCP Gateway installation
./scripts/ocp/setup-kagenti.sh --skip-mcp-gateway

# Skip the Kagenti UI and backend
./scripts/ocp/setup-kagenti.sh --skip-ui

# Dry run — show commands without executing
./scripts/ocp/setup-kagenti.sh --dry-run`;

export const kagentiSetupHighlighted = highlight(kagentiSetupCode);
export const kagentiSetupOptionsHighlighted = highlight(kagentiSetupOptionsCode);

export const jwtSvidHighlighted = highlight(jwtSvidCode);
export const valuesYamlHighlighted = highlight(valuesYamlCode);
export const deploymentLabelsHighlighted = highlight(deploymentLabelsCode);
export const serviceAccountHighlighted = highlight(serviceAccountCode);
export const svidVolumeMountHighlighted = highlight(svidVolumeMountCode);
export const k8sManifestHighlighted = highlight(k8sManifestCode);
export const authproxyRoutesHighlighted = highlight(authproxyRoutesCode);
export const tokenExchangeHighlighted = highlight(tokenExchangeCode);
export const checkIdentityHighlighted = highlight(checkIdentityCode);
export const validateSvidHighlighted = highlight(validateSvidCode);
