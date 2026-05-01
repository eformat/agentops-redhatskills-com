import { Demo } from '@/components/Demo'
import { CodeBlock } from '@/components/CodeBlock'
import { QuickNav } from '@/components/QuickNav'
import { FrameworkCards } from '@/components/FrameworkCards'
import { MarkdownLink } from '@/components/MarkdownLink'
import {
  quickNavItems,
  langgraphFiles, crewaiFiles, autogenFiles, llamaindexFiles, adkFiles,
  envVarsHighlighted, tokenAuthHighlighted,
  valuesYamlHighlighted, deploymentYamlHighlighted, initContainerYamlHighlighted,
} from './code-examples'

<QuickNav items={quickNavItems} />

<div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>

# Connect to MLFlow

<p className="MdSubtitle">
  Send agent traces from any framework to MLflow on Red Hat OpenShift AI.
  <MarkdownLink />
</p>

MLflow tracing captures every LLM call, tool invocation, and agent state transition
as structured spans. On OpenShift AI, MLflow runs as a managed service that your agent
connects to via environment variables — no code changes needed when moving between
standalone and operator-managed deployments.

The pattern is the same across all frameworks: read the tracking URI from the environment
and optionally authenticate with a service account token. Most frameworks use
`autolog()` for automatic trace collection. Google ADK uses OpenTelemetry natively —
you configure a `TracerProvider` with an OTLP exporter pointed at MLflow instead.
Either way, every trace is automatically collected, including LLM inputs/outputs,
latency, token counts, and tool results.

<FrameworkCards />

## OpenShift AI Setup

MLflow on OpenShift AI supports two deployment modes:
**standalone** (a Deployment + Service + PVC managed by your Helm chart) and
**CR mode** (an MLflow custom resource managed by the MLflow operator). Both expose the same
tracking API — only the connection details differ.

### Environment variables

Your agent reads these environment variables at startup. In standalone mode, only
`MLFLOW_TRACKING_URI` is required. In CR mode, the workspace and token file are also needed.

<CodeBlock title="Environment variables">{envVarsHighlighted}</CodeBlock>

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

### Authentication

In CR mode, the agent authenticates to the MLflow operator gateway using a Kubernetes
service account token. The token is mounted at the standard path and read at startup:

<CodeBlock title="Token file authentication">{tokenAuthHighlighted}</CodeBlock>

The operator gateway also requires a merged CA bundle (system CAs + Kubernetes service CA)
for TLS verification. This is handled by an init container in the deployment.

## Agent Frameworks

### LangGraph

[LangGraph](https://langchain-ai.github.io/langgraph/) is the most common framework for
building stateful, multi-actor agent applications. MLflow's `mlflow.langchain.autolog()`
automatically traces all LangChain and LangGraph components — LLM calls, tool executions,
graph node transitions, and state checkpoints.

This example is from the
[bank-voice-agent](https://github.com/eformat/bank-voice-agent) reference architecture,
which runs a multi-agent banking assistant on OpenShift AI with full MLflow observability.

<Demo files={langgraphFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">mlflow.langchain.autolog()</strong>
    <span> — Traces LLM calls, tool use, and graph state transitions</span>
  </div>
</Demo>

With `autolog()` enabled, every call to `graph.invoke()` or `graph.stream()` produces
a trace with spans for each node, LLM invocation, and tool call. No manual callbacks
are needed.

### CrewAI

[CrewAI](https://www.crewai.com/) orchestrates role-based AI agents working together as a crew.
MLflow's `mlflow.crewai.autolog()` captures each agent's task execution, tool calls, and
crew-level orchestration.

<Demo files={crewaiFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">mlflow.crewai.autolog()</strong>
    <span> — Traces crew orchestration, agent tasks, and tool calls</span>
  </div>
</Demo>

### AutoGen

[AutoGen](https://microsoft.github.io/autogen/) enables multi-agent conversations where
agents collaborate, debate, and solve problems together. MLflow's `mlflow.autogen.autolog()`
traces each agent turn, message exchange, and termination condition.

<Demo files={autogenFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">mlflow.autogen.autolog()</strong>
    <span> — Traces agent conversations, turns, and group chat flow</span>
  </div>
</Demo>

### LlamaIndex

[LlamaIndex](https://www.llamaindex.ai/) specializes in RAG pipelines and data-connected agents.
MLflow's `mlflow.llama_index.autolog()` captures document loading, embedding, retrieval, and
query engine execution.

<Demo files={llamaindexFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">mlflow.llama_index.autolog()</strong>
    <span> — Traces RAG retrieval, embedding, and query execution</span>
  </div>
</Demo>

### Google ADK

[Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/) builds agents using
Gemini models with built-in tool use. ADK emits OpenTelemetry spans natively — you configure
a `TracerProvider` with an `OTLPSpanExporter` pointed at MLflow's `/v1/traces` endpoint.
This requires `mlflow>=3.6`, `opentelemetry-sdk`, and `opentelemetry-exporter-otlp-proto-http`.
Set `MLFLOW_USE_DEFAULT_TRACER_PROVIDER=false` before importing mlflow to avoid duplicate traces.

<Demo files={adkFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">OpenTelemetry export</strong>
    <span> — Traces agent runs, tool calls, and Gemini model interactions</span>
  </div>
</Demo>

## OpenShift Deployment

The Helm chart handles MLflow deployment and injects the correct environment variables
into your agent's pod. The configuration differs between standalone and CR mode. 

### Standalone mode

Deploys MLflow as a Deployment + Service + PVC in your namespace. The agent connects
directly via HTTP. This is the simplest setup and works on any OpenShift cluster.
See the [chart deployment template](https://github.com/eformat/bank-voice-agent/blob/main/ai-voice-agent/deploy/chart/templates/mlflow-deployment.yaml)
for a full working example.

<CodeBlock title="values.yaml">{valuesYamlHighlighted}</CodeBlock>

### CR mode (MLflow Operator)

Uses the MLflow operator to manage MLflow as a custom resource. The operator provides
a gateway that handles multi-tenant workspace isolation and service account
authentication. An init container merges CA certificates for TLS.
See the [chart CR template](https://github.com/eformat/bank-voice-agent/blob/main/ai-voice-agent/deploy/chart/templates/mlflow-cr.yaml)
for a full working example.

<CodeBlock title="backend-deployment.yaml">{deploymentYamlHighlighted}</CodeBlock>

<CodeBlock title="Init container — CA bundle merge">{initContainerYamlHighlighted}</CodeBlock>

</div>
