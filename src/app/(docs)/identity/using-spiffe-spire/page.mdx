import { Demo } from '@/components/Demo'
import { CodeBlock } from '@/components/CodeBlock'
import { QuickNav } from '@/components/QuickNav'
import { FrameworkCards } from '@/components/FrameworkCards'
import { MarkdownLink } from '@/components/MarkdownLink'
import {
  quickNavItems,
  langgraphFiles, crewaiFiles, autogenFiles, llamaindexFiles, adkFiles,
  spiffeFormatHighlighted, jwtSvidHighlighted,
  valuesYamlHighlighted, deploymentLabelsHighlighted, serviceAccountHighlighted,
  svidVolumeMountHighlighted, k8sManifestHighlighted,
  authproxyRoutesHighlighted, tokenExchangeHighlighted,
  checkIdentityHighlighted, validateSvidHighlighted,
} from './code-examples'

<QuickNav items={quickNavItems} />

<div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>

# Using SPIFFE/SPIRE Identity

<p className="MdSubtitle">
  Give every agent a cryptographic workload identity on Red Hat OpenShift AI.
  <MarkdownLink />
</p>

Every AI agent running on OpenShift needs a verifiable identity to authenticate
to other services, sign traces, and prove its provenance. [SPIFFE](https://spiffe.io/)
(Secure Production Identity Framework for Everyone) provides a universal identity
control plane, and [SPIRE](https://spiffe.io/docs/latest/spire-about/) is its
production-ready implementation — issuing and rotating X.509 and JWT identity
documents scoped to each agent's workload.

With [kagenti](https://github.com/kagenti/kagenti), SPIRE integration is automatic.
Adding labels to your deployment triggers webhook injection of a `spiffe-helper`
sidecar that writes SVID files into the pod. Your agent code reads these files at
startup and uses the identity for AuthBridge token exchange, MLflow trace tagging,
and cross-service authentication — no static credentials required.

<FrameworkCards />

## SPIFFE/SPIRE Concepts

### Identity format

SPIFFE identities are URIs that uniquely identify a workload. On Kubernetes, the
identity encodes the trust domain, namespace, and service account:

<CodeBlock title="SPIFFE identity format">{spiffeFormatHighlighted}</CodeBlock>

The trust domain is the SPIRE server's domain (e.g., `localtest.me` for local
development, or your cluster's apps domain on OpenShift). The namespace and service
account map directly to Kubernetes resources, giving each agent a unique,
attestable identity.

### SVID types

SPIRE issues **SPIFFE Verifiable Identity Documents** (SVIDs) in two formats:

<div className="ApiTable">
  <table>
    <thead>
      <tr>
        <th>SVID Type</th>
        <th>File</th>
        <th>Use Case</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong className="MdStrong">JWT SVID</strong></td>
        <td><code className="MdCode">jwt_svid.token</code></td>
        <td>HTTP API authentication, token exchange with Keycloak, identity claims for tracing</td>
      </tr>
      <tr>
        <td><strong className="MdStrong">X.509 SVID</strong></td>
        <td><code className="MdCode">svid.pem</code> + <code className="MdCode">svid_key.pem</code></td>
        <td>mTLS between services, certificate-based authentication</td>
      </tr>
    </tbody>
  </table>
</div>

The `spiffe-helper` sidecar writes both to an `emptyDir` volume mounted at `/spiffe`.
Files are automatically rotated before expiry.

<CodeBlock title="JWT SVID payload">{jwtSvidHighlighted}</CodeBlock>

## Agent Frameworks

### LangGraph

[LangGraph](https://langchain-ai.github.io/langgraph/) is the most common framework for
building stateful, multi-actor agent applications. The SPIRE identity is loaded once at
startup by reading the JWT SVID from the mounted volume, then attached as tags to every
MLflow trace for provenance tracking.

This example is from the
[bank-voice-agent](https://github.com/redhat-et/bank-voice-agent) reference architecture,
which runs a multi-agent banking assistant on OpenShift AI with full SPIRE workload identity.

<Demo files={langgraphFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">SPIRE SVID loader + MLflow trace tags</strong>
    <span> — Reads JWT/X.509 SVIDs and tags traces with identity claims</span>
  </div>
</Demo>

The identity is loaded once at process start. Because LangGraph graph invocations run in
`asyncio.to_thread()`, MLflow's thread-local trace context doesn't carry over — so the
tagging function uses `client.search_traces(max_results=1)` to find the most recent trace.

### CrewAI

[CrewAI](https://www.crewai.com/) orchestrates role-based AI agents working together as a crew.
Each crew member inherits the pod's SPIRE identity, which can be logged or forwarded
to downstream services.

<Demo files={crewaiFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">SPIRE identity in CrewAI</strong>
    <span> — Loads workload identity at startup for zero-trust authentication</span>
  </div>
</Demo>

### AutoGen

[AutoGen](https://microsoft.github.io/autogen/) enables multi-agent conversations where
agents collaborate and solve problems together. SPIRE identity provides cryptographic
proof of which workload is hosting the conversation.

<Demo files={autogenFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">SPIRE identity in AutoGen</strong>
    <span> — Loads workload identity at startup for zero-trust authentication</span>
  </div>
</Demo>

### LlamaIndex

[LlamaIndex](https://www.llamaindex.ai/) specializes in RAG pipelines and data-connected agents.
SPIRE identity ensures that only attested workloads can access the retrieval pipeline
and its backing data sources.

<Demo files={llamaindexFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">SPIRE identity in LlamaIndex</strong>
    <span> — Loads workload identity at startup for zero-trust authentication</span>
  </div>
</Demo>

### Google ADK

[Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/) builds agents using
Gemini models with built-in tool use. The SPIRE identity can be exposed as an ADK tool,
letting the agent inspect and report its own workload identity.

<Demo files={adkFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">SPIRE identity as an ADK tool</strong>
    <span> — Agent can inspect its own SPIFFE workload identity</span>
  </div>
</Demo>

## OpenShift Deployment

### Kagenti labels and annotations

When `kagenti.enabled` is set, the Helm chart adds labels and annotations to your
deployment that trigger automatic sidecar injection. The kagenti webhook injects
four containers into the pod:

<div className="ApiTable">
  <table>
    <thead>
      <tr>
        <th>Container</th>
        <th>Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code className="MdCode">spiffe-helper</code></td>
        <td>Obtains SVIDs from the SPIRE agent and writes them to <code className="MdCode">/spiffe</code></td>
      </tr>
      <tr>
        <td><code className="MdCode">envoy-proxy</code></td>
        <td>AuthBridge sidecar — validates inbound JWTs, exchanges outbound tokens</td>
      </tr>
      <tr>
        <td><code className="MdCode">kagenti-client-registration</code></td>
        <td>Registers the workload's SPIFFE ID as a Keycloak client</td>
      </tr>
      <tr>
        <td><code className="MdCode">proxy-init</code></td>
        <td>iptables init container for Envoy traffic interception</td>
      </tr>
    </tbody>
  </table>
</div>

<CodeBlock title="Deployment labels and annotations">{deploymentLabelsHighlighted}</CodeBlock>

<div className="ApiTable">
  <table>
    <thead>
      <tr>
        <th>Label / Annotation</th>
        <th>Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code className="MdCode">kagenti.io/inject: "enabled"</code></td>
        <td>Triggers AuthBridge sidecar injection</td>
      </tr>
      <tr>
        <td><code className="MdCode">kagenti.io/spire: "enabled"</code></td>
        <td>Triggers SPIFFE helper sidecar injection</td>
      </tr>
      <tr>
        <td><code className="MdCode">kagenti.io/type: "agent"</code></td>
        <td>Registers workload as an agent in the kagenti catalog</td>
      </tr>
      <tr>
        <td><code className="MdCode">kagenti.io/client-registration-inject</code></td>
        <td>Auto-registers SPIFFE ID with Keycloak</td>
      </tr>
      <tr>
        <td><code className="MdCode">kagenti.io/inbound-ports-exclude</code></td>
        <td>Ports that bypass Envoy interception (e.g., WebSocket)</td>
      </tr>
    </tbody>
  </table>
</div>

### Helm chart configuration

Enable kagenti integration with a single flag. The chart creates a dedicated
ServiceAccount for SPIRE identity binding, exposes the A2A port, mounts the SVID
volume, and sets the `KAGENTI_ENABLED` environment variable.

<CodeBlock title="values.yaml">{valuesYamlHighlighted}</CodeBlock>

<CodeBlock title="ServiceAccount">{serviceAccountHighlighted}</CodeBlock>

<CodeBlock title="SVID volume mount">{svidVolumeMountHighlighted}</CodeBlock>

### Kubernetes manifests

For deployments without Helm, apply the kagenti labels directly to your Kubernetes
manifests. Each agent needs a ServiceAccount, a Service with the A2A port, and a
Deployment with the correct labels.
See the [kagenti agent examples](https://github.com/kagenti/kagenti-agent-examples)
for complete working manifests.

<CodeBlock title="k8s.yaml">{k8sManifestHighlighted}</CodeBlock>

## AuthBridge

AuthBridge is the kagenti component that handles zero-trust authentication for
agent-to-service communication. It runs as an Envoy sidecar that intercepts
HTTP traffic in both directions:

- **Inbound** — validates JWT signature, expiration, and issuer via JWKS; returns 401 for invalid tokens
- **Outbound** — exchanges the agent's SPIRE SVID for a Keycloak-issued JWT scoped to the target service

### Outbound route configuration

A ConfigMap controls which outbound requests get token exchange. Routes use
first-match-wins with glob patterns. Internal services (Kubernetes API, LLM
endpoints, MLflow) are set to passthrough; everything else gets a token exchange
via Keycloak.

<CodeBlock title="authproxy-routes.yaml">{authproxyRoutesHighlighted}</CodeBlock>

### Token exchange

AuthBridge implements [RFC 8693 OAuth2 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693).
The agent's SPIRE SVID is used as the client credential, and the user's token is
exchanged for a scoped token with the target service's audience. This provides
least-privilege access — each tool receives only the permissions needed.

<CodeBlock title="Token exchange (Python)">{tokenExchangeHighlighted}</CodeBlock>

## Verifying Identity

You can verify that SPIRE identity is working by inspecting the SVID files on the
pod, or by using a `check_identity` tool that calls an echo service to show the
JWT claims that AuthBridge attaches to outbound requests.

<CodeBlock title="Validate SVIDs on a running pod">{validateSvidHighlighted}</CodeBlock>

<CodeBlock title="check_identity tool">{checkIdentityHighlighted}</CodeBlock>

The echo service decodes the Bearer token that AuthBridge attached to the outbound
request and returns the claims — including `sub` (the user identity), `azp` (the
agent's SPIFFE ID as authorized party), `scope`, and `groups`. This demonstrates
the full zero-trust flow: SPIRE SVID to Keycloak token exchange to scoped access.

</div>
