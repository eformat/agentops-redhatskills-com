import { QuickNav } from '@/components/QuickNav'
import { MarkdownLink } from '@/components/MarkdownLink'

<QuickNav items={[
  { id: 'agent-sandboxing', text: 'Agent Sandboxing', level: 2 },
  { id: 'workload-identity', text: 'Workload Identity', level: 2 },
  { id: 'mutual-tls', text: 'Mutual TLS', level: 2 },
  { id: 'policy-enforcement', text: 'Policy Enforcement', level: 2 },
  { id: 'secrets-management', text: 'Secrets Management', level: 2 },
]} />

<div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>

# Security

<p className="MdSubtitle">
  Sandbox code execution, authenticate workloads, and enforce policy for agents on OpenShift.
  <MarkdownLink />
</p>

Agent security on OpenShift covers multiple concerns: isolating LLM-generated code execution,
establishing workload identity, encrypting inter-agent communication, enforcing policy at the
gateway, and managing secrets for LLM API keys and tool credentials.

## Agent Sandboxing

When agents execute LLM-generated code — tool calls, data analysis scripts, or
code-interpreter tasks — that code must run in a sandbox that prevents filesystem
access, network exfiltration, and privilege escalation. The
[Agent Sandboxing](/security/agent-sandboxing) page covers a defense-in-depth
approach that layers static analysis, isolated subprocesses, Landlock filesystem
restrictions, seccomp syscall filtering, and OpenShift-level NetworkPolicy and
SeccompProfile enforcement.

## Workload Identity

SPIRE and SPIFFE provide cryptographic identity for agent workloads. Each agent
pod receives an x509 SVID (SPIFFE Verifiable Identity Document) that identifies
it within the trust domain. The SPIRE agent runs as a DaemonSet and attests pods
via the Kubernetes workload registrar. See
[Using SPIFFE/SPIRE](/identity/using-spiffe-spire) for setup details.

## Mutual TLS

Agents communicate over mutual TLS using SPIFFE SVIDs. Both sides of a connection
present certificates and verify the peer's SPIFFE ID against an allowlist. This
prevents unauthorized agents from joining the mesh and ensures all inter-agent
traffic is encrypted in transit.

## Policy Enforcement

The agent gateway enforces authorization policies before routing requests to
backend agents. Policies are expressed as Kubernetes RBAC rules — the gateway
checks the caller's service account token against RoleBindings in the target
namespace. This provides namespace-level isolation between agent deployments.

## Secrets Management

LLM API keys, tool credentials, and other sensitive values are stored as
Kubernetes Secrets and mounted into agent pods via projected volumes. For
production deployments, integrate with an external secrets operator
(e.g. External Secrets Operator backed by HashiCorp Vault or AWS Secrets Manager)
to avoid storing secrets directly in the cluster's etcd.

</div>
