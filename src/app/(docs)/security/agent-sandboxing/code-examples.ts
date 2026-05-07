import { highlight } from '@/utils/highlight';

export const quickNavItems = [
  { id: 'defense-in-depth', text: 'Defense in Depth', level: 2 },
  { id: 'agent-frameworks', text: 'Agent Frameworks', level: 2 },
  { id: 'environment-variables', text: 'Environment variables', level: 3 },
  { id: 'langgraph', text: 'LangGraph', level: 3 },
  { id: 'crewai', text: 'CrewAI', level: 3 },
  { id: 'autogen', text: 'AutoGen', level: 3 },
  { id: 'llamaindex', text: 'LlamaIndex', level: 3 },
  { id: 'google-adk', text: 'Google ADK', level: 3 },
  { id: 'static-analysis', text: 'Static Analysis', level: 2 },
  { id: 'ast-guardrails', text: 'AST guardrails', level: 3 },
  { id: 'import-allowlist', text: 'Import allowlist', level: 3 },
  { id: 'isolated-subprocess', text: 'Isolated Subprocess', level: 2 },
  { id: 'runtime-preamble', text: 'Runtime preamble', level: 3 },
  { id: 'resource-limits', text: 'Resource limits', level: 3 },
  { id: 'landlock-filesystem-restriction', text: 'Landlock Filesystem Restriction', level: 2 },
  { id: 'parent-process', text: 'Parent process', level: 3 },
  { id: 'subprocess-tightening', text: 'Subprocess tightening', level: 3 },
  { id: 'seccomp-syscall-filtering', text: 'Seccomp Syscall Filtering', level: 2 },
  { id: 'openshift-deployment', text: 'OpenShift Deployment', level: 2 },
  { id: 'sidecar-deployment', text: 'Sidecar deployment', level: 3 },
  { id: 'profiles', text: 'Profiles', level: 3 },
  { id: 'pod-security-context', text: 'Pod security context', level: 3 },
  { id: 'networkpolicy', text: 'NetworkPolicy', level: 3 },
  { id: 'seccompprofile-spo', text: 'SeccompProfile (SPO)', level: 3 },
  { id: 'custom-scc', text: 'Custom SCC', level: 3 },
  { id: 'deploying', text: 'Deploying', level: 2 },
];

const guardrailsCode = `from sandbox.guardrails import validate_code

# Validate LLM-generated code before execution
violations = validate_code(source, allowed_imports=profile.allowed_imports)

if violations:
    return {"error": "Code rejected", "violations": violations}

# Safe to execute — pass to the sandbox
result = await execute_code(source, timeout=30.0)`;

const astVisitorCode = `# Blocked bare function calls
BLOCKED_CALLS = frozenset({
    "eval", "exec", "compile", "__import__", "open",
    "getattr", "setattr", "delattr", "breakpoint", "input",
    "globals", "locals", "vars",
})

# Blocked attribute access on any object
BLOCKED_DUNDERS = frozenset({
    "__subclasses__", "__globals__", "__builtins__",
    "__class__", "__bases__", "__mro__",
    "__dict__", "__code__", "__closure__",
    "__getattribute__", "__getattr__", "__self__",
    "__loader__", "__spec__", "__func__", "__wrapped__",
})

# Frame/generator attributes that expose execution frames
BLOCKED_FRAME_ATTRS = frozenset({
    "f_globals", "f_locals", "f_builtins", "f_code",
    "gi_frame", "gi_code", "cr_frame", "cr_code",
})

# Private module references (e.g. random._os -> os)
BLOCKED_MODULE_ALIASES = frozenset({
    "_os", "_sys", "_subprocess", "_socket", "_signal",
    "_ctypes", "_multiprocessing", "_pickle",
})`;

const allowedImportsCode = `# Minimal profile — stdlib only, no filesystem or network access
ALLOWED_IMPORTS = frozenset({
    "math", "statistics", "itertools", "functools",
    "re", "datetime", "collections", "json", "csv",
    "string", "textwrap", "decimal", "fractions",
    "random", "operator", "typing",
})

# Data-science profile — extends minimal with numpy/pandas/scipy
DATA_SCIENCE_IMPORTS = ALLOWED_IMPORTS | frozenset({
    "numpy", "pandas", "scipy",
})`;

const executorCode = `async def execute_code(
    code: str,
    timeout: float = 10.0,
    *,
    memory_limit_mb: int = 512,
    allowed_imports: frozenset[str] | None = None,
    subprocess_landlock: bool = True,
    subprocess_seccomp: bool = True,
) -> ExecutionResult:
    # Build the defense-in-depth preamble
    code = build_memory_preamble(memory_limit_mb) + code
    code = build_preamble(
        allowed_imports=allowed_imports,
        landlock=subprocess_landlock,
        seccomp=subprocess_seccomp,
    ) + code

    # Write to temp file and execute in isolated mode
    with tempfile.NamedTemporaryFile(
        suffix=".py", dir="/tmp", delete=False
    ) as tmp:
        tmp.write(code)

    process = await asyncio.create_subprocess_exec(
        "python3", "-I", tmp.name,  # -I = isolated mode
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    raw_stdout, raw_stderr = await asyncio.wait_for(
        process.communicate(), timeout=timeout
    )`;

const preambleCode = `# Preamble injection order in the subprocess:
# 1. RLIMIT_AS memory limit (before any imports)
# 2. Pre-imports (pandas, numpy — need full builtins to init)
# 3. Landlock second ruleset (tighter filesystem)
# 4. Seccomp BPF filter (block networking + io_uring)
# 5. Runtime import hook + dunder blocking + builtin purging
# 6. User code executes

# Runtime import hook — blocks any module not in the allowlist
def _rimp(name, gl=None, lo=None, fromlist=(), level=0):
    top = name.split('.')[0]
    if level == 0 and top not in _allowed:
        caller = (gl or {}).get('__name__', '__main__')
        if caller == '__main__':
            raise ImportError(f"import of '{name}' blocked by sandbox")
    return _orig(name, gl, lo, fromlist, level)

# Remove dangerous builtins
for _name in ('open', 'breakpoint', 'input'):
    builtins.pop(_name, None)

# Monkey-patch operator to reject dunder attribute access
_orig_ag = operator.attrgetter
def _safe_attrgetter(*attrs):
    for a in attrs:
        for part in str(a).split('.'):
            if _dunder_re.match(part):
                raise RuntimeError('dunder access blocked by sandbox')
    return _orig_ag(*attrs)`;

const landlockPathsCode = `# Parent process Landlock paths (applied at FastAPI startup)
READ_ONLY_PATHS = [
    "/usr",           # Python binary, stdlib, system tools
    "/lib",           # Shared libraries
    "/lib64",         # 64-bit shared libraries
    "/etc",           # Timezone, locale, ld.so.cache
    "/opt/app-root",  # UBI app directory (FastAPI app)
    "/proc/self",     # Python reads /proc/self/fd, /proc/self/status
]
READ_WRITE_PATHS = ["/tmp"]

# Subprocess Landlock paths (tighter — drops /opt/app-root, /etc)
SUBPROCESS_READ_ONLY = ["/usr", "/lib", "/lib64", "/proc/self"]
SUBPROCESS_READ_WRITE = ["/tmp"]`;

const landlockApplyCode = `from sandbox.landlock import apply_sandbox_landlock

# Apply at FastAPI startup — inherited by all subprocesses
status = apply_sandbox_landlock()

# status.applied    → True if Landlock is active
# status.abi_version → 1-5 depending on kernel
# status.rules_applied → ["ro:/usr", "ro:/lib", ..., "rw:/tmp"]

# Landlock requires no_new_privs (set automatically by
# OpenShift restricted-v2 SCC via allowPrivilegeEscalation: false)

# ABI version matrix:
#   v1 — filesystem restrictions (Linux 5.13, RHEL 9.2+)
#   v2 — cross-directory rename/link (Linux 5.19)
#   v3 — TRUNCATE right (Linux 6.2)
#   v4 — TCP bind/connect restrictions (Linux 6.7)
#   v5 — abstract Unix socket + signal scope (Linux 6.10)`;

const seccompBlockedCode = `# Syscalls blocked by the subprocess BPF filter
BLOCKED_SYSCALLS = {
    # All networking — closes the UDP gap Landlock v4 doesn't cover
    "socket": 41,  "connect": 42,  "accept": 43,
    "sendto": 44,  "recvfrom": 45, "sendmsg": 46,
    "recvmsg": 47, "bind": 49,     "listen": 50,
    "setsockopt": 54, "getsockopt": 55, "accept4": 288,

    # io_uring — container escape vector
    "io_uring_setup": 425,
    "io_uring_enter": 426,
    "io_uring_register": 427,

    # splice — CVE-2026-31431 (Copy Fail privilege escalation)
    "splice": 275,
}

# Filter uses SECCOMP_RET_ERRNO (EPERM) for clean errors
# Wrong-architecture processes are killed immediately`;

const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-sandbox
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
      containers:
        - name: sandbox
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
            seccompProfile:
              type: Localhost
              localhostProfile: operator/code-sandbox-sandbox.json
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir:
            sizeLimit: 10Mi`;

const networkPolicyYaml = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: code-sandbox
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: code-sandbox
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        # Only pods with this label can connect
        - podSelector:
            matchLabels:
              code-sandbox-client: "true"
      ports:
        - port: 8000
          protocol: TCP
  # Zero egress — no outbound traffic allowed
  egress: []`;

const seccompProfileYaml = `apiVersion: security-profiles-operator.x-k8s.io/v1beta1
kind: SeccompProfile
metadata:
  name: code-sandbox-sandbox
spec:
  defaultAction: SCMP_ACT_ERRNO
  syscalls:
    # Allow: process mgmt, file I/O, memory, signals, timing
    - action: SCMP_ACT_ALLOW
      names: [fork, vfork, clone, clone3, execve, wait4, exit, exit_group]
    - action: SCMP_ACT_ALLOW
      names: [read, write, openat, close, lseek, dup, pipe2, fcntl]
    - action: SCMP_ACT_ALLOW
      names: [mmap, mprotect, munmap, mremap, brk, madvise]
    - action: SCMP_ACT_ALLOW
      names: [stat, fstat, newfstatat, access, getcwd, getdents64]
    # Allow: networking (uvicorn needs it, subprocess BPF blocks it)
    - action: SCMP_ACT_ALLOW
      names: [socket, bind, listen, accept4, connect, sendto, recvfrom]
    # Allow: Landlock LSM syscalls
    - action: SCMP_ACT_ALLOW
      names: [landlock_create_ruleset, landlock_add_rule, landlock_restrict_self]
    # Block: dangerous syscalls
    - action: SCMP_ACT_ERRNO
      names:
        - io_uring_setup      # container escape vector
        - io_uring_enter
        - io_uring_register
        - splice              # CVE-2026-31431
        - ptrace
        - process_vm_readv
        - process_vm_writev
        - mount
        - umount2
        - chroot
        - bpf
        - unshare
        - setns`;

const sccYaml = `apiVersion: security.openshift.io/v1
kind: SecurityContextConstraints
metadata:
  name: code-sandbox-seccomp
allowHostDirVolumePlugin: false
allowHostIPC: false
allowHostNetwork: false
allowHostPID: false
allowHostPorts: false
allowPrivilegeEscalation: false
allowPrivilegedContainer: false
allowedCapabilities: []
defaultAddCapabilities: []
requiredDropCapabilities:
  - ALL
readOnlyRootFilesystem: true
runAsUser:
  type: MustRunAsRange
fsGroup:
  type: MustRunAs
  ranges:
    - min: 1
      max: 65534
seLinuxContext:
  type: MustRunAs
seccompProfiles:
  - runtime/default
  - localhost/operator/code-sandbox-sandbox.json
volumes:
  - emptyDir
  - projected
  - configMap
  - secret
  - downwardAPI
  - persistentVolumeClaim`;

const deployStepsCode = `# 1. Create namespace
oc new-project code-sandbox

# 2. Build image in-cluster (project uses Containerfile, not Dockerfile)
oc new-build --name=code-sandbox --binary --strategy=docker -n code-sandbox
oc patch bc/code-sandbox -n code-sandbox \\
  -p '{"spec":{"strategy":{"dockerStrategy":{"dockerfilePath":"Containerfile"}}}}'
oc start-build code-sandbox --from-dir=. -n code-sandbox

# 3. Apply custom SCC (allows localhost seccomp profiles)
oc apply -f scc.yaml
oc adm policy add-scc-to-user code-sandbox-seccomp -z default -n code-sandbox

# 4. Helm install
helm install code-sandbox ./chart \\
  -f chart/values-standalone.yaml \\
  --set image.repository=image-registry.openshift-image-registry.svc:5000/code-sandbox/code-sandbox \\
  --set image.tag=latest \\
  -n code-sandbox

# 5. Verify
oc rollout status deployment/code-sandbox -n code-sandbox --timeout=120s`;

const verifyCode = `# Health check
oc run test-client --rm -i --restart=Never \\
  --labels="code-sandbox-client=true" \\
  --image=registry.access.redhat.com/ubi9/ubi-minimal:latest \\
  -n code-sandbox -- \\
  curl -s http://code-sandbox.code-sandbox.svc:8000/healthz

# Execute code in the sandbox
oc run test-exec --rm -i --restart=Never \\
  --labels="code-sandbox-client=true" \\
  --image=registry.access.redhat.com/ubi9/ubi-minimal:latest \\
  -n code-sandbox -- \\
  curl -s -X POST http://code-sandbox.code-sandbox.svc:8000/execute \\
  -H 'Content-Type: application/json' \\
  -d '{"code":"import math\\nprint(f\\"pi = {math.pi}\\")"}'`;

// ── Framework examples ──────────────────────────────────────────
// Each agent uses a run_code tool that calls the sandbox sidecar at
// localhost:8000. The sidecar shares the pod network namespace, so
// no cross-pod traffic or NetworkPolicy client labels are needed.

const runCodeBody = `    response = httpx.post(
        f"{SANDBOX_URL}/execute",
        json={"code": code},
        timeout=35.0,
    )
    if response.status_code != 200:
        return f"Sandbox error (HTTP {response.status_code}): {response.text}"

    result = response.json()
    parts = []
    if result.get("stdout"):
        parts.append(result["stdout"])
    if result.get("result") is not None:
        parts.append(f"Result: {result['result']}")
    if result.get("stderr"):
        parts.append(f"Stderr: {result['stderr']}")
    if result.get("error"):
        parts.append(f"Error: {result['error']}")
    return "\\n".join(parts) if parts else "(no output)"`;

const langgraphCode = `"""Code interpreter agent with sandbox — LangGraph."""

import os
import httpx
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

# Sidecar runs in the same pod — no cross-pod network traffic
SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://localhost:8000")


def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
${runCodeBody}


llm = ChatOpenAI(
    model=os.environ.get("OPENAI_MODEL_NAME", "gpt-4o-mini"),
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)
agent = create_react_agent(
    llm,
    tools=[run_code],
    prompt="You are a code interpreter. Write Python code to solve "
           "the user's problem, execute it with run_code, and "
           "summarize the output.",
)

result = agent.invoke(
    {"messages": [{"role": "user",
                   "content": "Calculate the first 20 Fibonacci numbers"}]}
)

for msg in result["messages"]:
    print(f"{msg.type}: {msg.content}")`;

const langgraphReqs = `langgraph>=0.4
langchain-openai>=0.3
httpx`;

const crewaiCode = `"""Code interpreter agent with sandbox — CrewAI."""

__import__("pysqlite3")
import sys
sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")

import os
import httpx
from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool

SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://localhost:8000")


@tool("run_code")
def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
${runCodeBody}


llm = LLM(
    model=f"openai/{os.environ.get('OPENAI_MODEL_NAME', 'gpt-4o-mini')}",
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)

coder = Agent(
    role="Code Interpreter",
    goal="Write and execute Python code to solve problems",
    backstory="You are an expert Python programmer. Write code, "
              "run it in the sandbox via the run_code tool, and "
              "report the results.",
    llm=llm,
    tools=[run_code],
    max_iter=5,
)

task = Task(
    description="Calculate the first 20 Fibonacci numbers using "
                "Python. Use the run_code tool to execute your code.",
    expected_output="The first 20 Fibonacci numbers",
    agent=coder,
)

crew = Crew(agents=[coder], tasks=[task])
result = crew.kickoff()
print(result.raw)`;

const crewaiReqs = `crewai[litellm]>=0.121
pysqlite3-binary
httpx`;

const autogenCode = `"""Code interpreter agent with sandbox — AutoGen."""

import os
import asyncio
import httpx
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://localhost:8000")


def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
${runCodeBody}


model_name = os.environ.get("OPENAI_MODEL_NAME", "gpt-4o-mini")
model_client = OpenAIChatCompletionClient(
    model=model_name,
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
    model_info={
        "vision": False,
        "function_calling": True,
        "json_output": True,
        "structured_output": True,
        "family": "unknown",
    },
)

agent = AssistantAgent(
    name="code_interpreter",
    model_client=model_client,
    tools=[run_code],
    system_message="You are a code interpreter. Write Python code "
                   "to solve problems, execute it with run_code, "
                   "and summarize the output.",
)


async def main():
    result = await agent.run(
        task="Calculate the first 20 Fibonacci numbers"
    )
    print(result.messages[-1].content)


asyncio.run(main())`;

const autogenReqs = `autogen-agentchat>=0.4
autogen-ext[openai]>=0.4
httpx`;

const llamaindexCode = `"""Code interpreter agent with sandbox — LlamaIndex."""

import os
import asyncio
import httpx
from llama_index.core.agent.workflow import AgentWorkflow, ReActAgent
from llama_index.core.tools import FunctionTool
from llama_index.llms.openai_like import OpenAILike

SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://localhost:8000")


def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
${runCodeBody}


llm = OpenAILike(
    model=os.environ.get("OPENAI_MODEL_NAME", "gpt-4o-mini"),
    api_base=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
    is_chat_model=True,
    is_function_calling_model=False,
    context_window=128000,
)

react_agent = ReActAgent(
    name="code_interpreter",
    description="Executes Python code in a sandbox",
    tools=[FunctionTool.from_defaults(fn=run_code)],
    llm=llm,
)

agent = AgentWorkflow(
    agents=[react_agent], root_agent="code_interpreter"
)


async def main():
    response = await agent.run(
        "Calculate the first 20 Fibonacci numbers"
    )
    print(response)


asyncio.run(main())`;

const llamaindexReqs = `llama-index>=0.12
llama-index-llms-openai-like>=0.4
httpx`;

const adkCode = `"""Code interpreter agent with sandbox — Google ADK."""

import os
import asyncio
import httpx
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://localhost:8000")


def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
${runCodeBody}


model = LiteLlm(
    model=f"openai/{os.environ.get('OPENAI_MODEL_NAME', 'gpt-4o-mini')}",
    api_base=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)

agent = Agent(
    name="code_interpreter",
    model=model,
    description="A code interpreter that runs Python safely",
    instruction="You are a code interpreter. Write Python code to "
                "solve problems, execute it with run_code, and "
                "summarize the output.",
    tools=[run_code],
)

session_service = InMemorySessionService()
runner = Runner(
    agent=agent, app_name="code_interpreter",
    session_service=session_service,
)


async def main():
    session = await session_service.create_session(
        app_name="code_interpreter", user_id="user1",
    )
    message = types.Content(
        role="user",
        parts=[types.Part(
            text="Calculate the first 20 Fibonacci numbers"
        )],
    )
    async for event in runner.run_async(
        user_id="user1", session_id=session.id,
        new_message=message,
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)


asyncio.run(main())`;

const adkReqs = `google-adk>=1.2
litellm
httpx`;

const envVarsCode = `# The sandbox sidecar shares the pod network — no service URL needed
# SANDBOX_URL defaults to http://localhost:8000

# LLM endpoint (OpenAI or any compatible API)
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL_NAME="gpt-4o-mini"

# Optional: use a local or hosted model instead
# export OPENAI_BASE_URL="http://maas.apps.my-cluster.example.com/v1"`;

// ── Sidecar deployment ──────────────────────────────────────────

const sidecarValuesYaml = `# chart/values.yaml — enable the sandbox sidecar
sandbox:
  enabled: true
  # Profile controls which imports are allowed:
  #   minimal      — stdlib only (math, json, csv, etc.)
  #   data-science — adds numpy, pandas, scipy
  profile: minimal
  image:
    repository: code-sandbox
    tag: latest
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi
  # Requires Security Profiles Operator + custom SCC
  seccomp:
    enabled: false`;

const sidecarDeploymentYaml = `# chart/templates/deployment.yaml — sandbox sidecar container
containers:
  - name: agent
    image: "my-agent:latest"
    env:
      - name: SANDBOX_URL
        value: "http://localhost:8000"
    # ... agent container config ...

  - name: sandbox
    image: "code-sandbox:latest"
    ports:
      - containerPort: 8000
    env:
      - name: SANDBOX_PROFILE
        value: "minimal"
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
          - ALL
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8000
    volumeMounts:
      - name: sandbox-tmp
        mountPath: /tmp
volumes:
  - name: sandbox-tmp
    emptyDir:
      sizeLimit: 10Mi`;

const profilesYaml = `# profiles/minimal.yaml — default, stdlib-only
name: minimal
imports:
  allowed:
    - math
    - statistics
    - itertools
    - functools
    - re
    - datetime
    - collections
    - json
    - csv
    - string
    - textwrap
    - decimal
    - fractions
    - random
    - operator
    - typing
blocklist: []
resources:
  memory: 256Mi
  cpu: 500m
  timeout_max: 30.0

---
# profiles/data-science.yaml — extends minimal
name: data-science
extends: minimal
preimport:
  - numpy
  - pandas
  - scipy
imports:
  additional:
    - numpy
    - pandas
    - scipy
blocklist:
  - [numpy, ctypeslib]
  - [numpy, frompyfunc]
  - [pandas, read_pickle]
  - [pandas, read_sql]
  - [pandas, read_html]
  - [pandas, read_excel]
  - [pandas, read_parquet]
  - [scipy.io, loadmat]
  - [scipy.io, savemat]
resources:
  memory: 512Mi
  subprocess_memory_mb: 800`;

export const langgraphFiles = [
  { name: 'agent.py', content: highlight(langgraphCode), language: 'python' },
  { name: 'requirements.txt', content: highlight(langgraphReqs), language: 'text' },
];

export const crewaiFiles = [
  { name: 'agent.py', content: highlight(crewaiCode), language: 'python' },
  { name: 'requirements.txt', content: highlight(crewaiReqs), language: 'text' },
];

export const autogenFiles = [
  { name: 'agent.py', content: highlight(autogenCode), language: 'python' },
  { name: 'requirements.txt', content: highlight(autogenReqs), language: 'text' },
];

export const llamaindexFiles = [
  { name: 'agent.py', content: highlight(llamaindexCode), language: 'python' },
  { name: 'requirements.txt', content: highlight(llamaindexReqs), language: 'text' },
];

export const adkFiles = [
  { name: 'agent.py', content: highlight(adkCode), language: 'python' },
  { name: 'requirements.txt', content: highlight(adkReqs), language: 'text' },
];

export const envVarsHighlighted = highlight(envVarsCode);
export const sidecarValuesHighlighted = highlight(sidecarValuesYaml);
export const sidecarDeploymentHighlighted = highlight(sidecarDeploymentYaml);
export const profilesHighlighted = highlight(profilesYaml);

export const guardrailsHighlighted = highlight(guardrailsCode);
export const astVisitorHighlighted = highlight(astVisitorCode);
export const allowedImportsHighlighted = highlight(allowedImportsCode);
export const executorHighlighted = highlight(executorCode);
export const preambleHighlighted = highlight(preambleCode);
export const landlockPathsHighlighted = highlight(landlockPathsCode);
export const landlockApplyHighlighted = highlight(landlockApplyCode);
export const seccompBlockedHighlighted = highlight(seccompBlockedCode);
export const deploymentYamlHighlighted = highlight(deploymentYaml);
export const networkPolicyHighlighted = highlight(networkPolicyYaml);
export const seccompProfileHighlighted = highlight(seccompProfileYaml);
export const sccHighlighted = highlight(sccYaml);
export const deployStepsHighlighted = highlight(deployStepsCode);
export const verifyHighlighted = highlight(verifyCode);
