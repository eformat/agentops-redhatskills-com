---
name: agent-sandboxing
description: Add a secure code sandbox to a scaffolded agent. Inserts the run_code tool into agent.py, starts the sandbox, runs verification tests, and optionally adds MLflow tracing for full observability. Run when the user asks to add code execution, a sandbox, or a code interpreter to an agent.
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

You are a sandboxing assistant. Your job is to add a secure code
execution sandbox to an existing Python agent following the pattern from
https://agentops.redhatskills.com/security/agent-sandboxing.md.

The sandbox runs as a standalone service (or local container for
development) reachable at a configurable URL (default localhost:8000).
Your agent's `run_code` tool sends LLM-generated Python
code to `POST /execute` and gets back stdout, stderr, and exit code.
The sandbox provides five layers of defense-in-depth: AST guardrails,
runtime import hook, Landlock filesystem restriction, seccomp syscall
filtering, and container-level enforcement. Source code is at
https://github.com/eformat/code-sandbox.

## Step 1: Locate the agent

Parse `$ARGUMENTS` for:
- `--agent-dir <path>`: Directory containing `agent.py` + `requirements.txt`
- `--headless`: Skip clarifying questions and use all defaults
- `--sandbox-profile <name>`: Sandbox profile (`minimal` or `data-science`, default: `minimal`)
- `--with-mlflow`: Also add MLflow tracing for full observability of sandbox tool calls

If `--agent-dir` was NOT provided in `$ARGUMENTS`, ask the user (using
AskUserQuestion):

1. **Where is your scaffolded agent?** -- the directory that contains
   `agent.py` and `requirements.txt`. Offer these options:
   - Current directory (`.`)
   - A specific path (let the user type it)
   - **I haven't scaffolded one yet**

### If the user has not scaffolded an agent

Ask which framework they want (using AskUserQuestion). The question text
must list all five frameworks (LangGraph, CrewAI, AutoGen, LlamaIndex,
Google ADK) so the user sees every option even though AskUserQuestion is
limited to 4 choices. Use "LlamaIndex" and "Google ADK" as a combined
fourth option or put Google ADK as the "Other" free-text fallback.

| Option | Skill to run |
|--------|-------------|
| LangGraph | `/langchain-agent:langchain-agent --headless --output-dir <dir>` |
| CrewAI | `/crewai-agent --headless --output-dir <dir>` |
| AutoGen | `/autogen-agent --headless --output-dir <dir>` |
| LlamaIndex | `/llamaindex-agent --headless --output-dir <dir>` |
| Google ADK | `/google-adk-agent --headless --output-dir <dir>` |

First ask the user for a directory to scaffold into (e.g. `./my-agent`).
Tell the user you will scaffold a default agent first. Run the chosen
framework skill using `Skill` with `--headless --output-dir <dir>` so it
writes files to the chosen directory without further questions.

**IMPORTANT**: After the scaffolding skill completes, do NOT stop or wait
for user input. Immediately continue to Step 2 using the output directory
as the agent directory. The entire flow (Steps 2-9) must complete in one
go without pausing.

## Step 2: Validate agent folder

Check that the agent directory contains both `agent.py` and
`requirements.txt`. Run `ls <agent-dir>/agent.py <agent-dir>/requirements.txt`
via Bash.

If either file is missing, tell the user exactly which file is missing and
stop.

## Step 3: Detect the framework

Read `<agent-dir>/agent.py` and identify the framework from its imports:

| Imports containing | Framework |
|-------------------|-----------|
| `langchain` or `langgraph` | LangGraph |
| `crewai` | CrewAI |
| `autogen` | AutoGen |
| `llama_index` | LlamaIndex |
| `google.adk` | Google ADK |

If none of these imports are found, ask the user which framework the
agent uses (using AskUserQuestion) and proceed with their answer.

## Step 4: Insert the run_code tool function

Use `Edit` to insert the sandbox integration into `agent.py`. The
insertion has two parts:

### Part A -- Imports and SANDBOX_URL constant

Place **after** the existing imports and **before** the first non-import
code (look for the first function definition, class definition, or
variable assignment that is not an import).

```python
import httpx

SANDBOX_URL = os.environ.get("SANDBOX_URL", "http://localhost:8000")
```

If `import os` is missing, add it. If `import httpx` already exists, do
NOT add a duplicate.

### Part B -- The run_code function

Place **after** existing tool function definitions and **before** the
agent setup code (the LLM/model initialization or agent constructor).

For **LangGraph, AutoGen, LlamaIndex, and Google ADK**, insert:

```python
def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
    response = httpx.post(
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
    return "\n".join(parts) if parts else "(no output)"
```

For **CrewAI**, the function must have the `@tool` decorator. Also ensure
`from crewai.tools import tool` is imported (it should be from the
scaffold). Insert:

```python
@tool("run_code")
def run_code(code: str) -> str:
    """Execute Python code in a secure sandbox.

    Use this for computation, data analysis, or any task that
    benefits from running code. Available imports depend on the
    sandbox profile (minimal: stdlib only; data-science: adds
    numpy, pandas, scipy). No filesystem or network access.
    """
    response = httpx.post(
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
    return "\n".join(parts) if parts else "(no output)"
```

## Step 5: Register the run_code tool with the agent

Use `Edit` to **append** `run_code` to the existing `tools=[...]` list in
the agent constructor. Do NOT replace existing tools -- add `run_code`
after whatever tools are already registered.

| Framework | What to edit |
|-----------|-------------|
| LangGraph | Add `run_code` to `tools=[..., run_code]` in `create_react_agent(...)` |
| CrewAI | Add `run_code` to `tools=[..., run_code]` in `Agent(...)` |
| AutoGen | Add `run_code` to `tools=[..., run_code]` in `AssistantAgent(...)` |
| LlamaIndex | Add `FunctionTool.from_defaults(fn=run_code)` to `tools=[...]` in `ReActAgent(...)`. Ensure `from llama_index.core.tools import FunctionTool` is imported. |
| Google ADK | Add `run_code` to `tools=[..., run_code]` in `Agent(...)` |

## Step 5b: Add a sandbox test prompt

Use `Edit` to add a second invocation after the existing test prompt
that exercises the `run_code` tool. The prompt should be:
`"Calculate the first 20 Fibonacci numbers using Python code"`

| Framework | What to add |
|-----------|-------------|
| LangGraph | Add a second `agent.invoke(...)` call after the existing one: `result = agent.invoke({"messages": [{"role": "user", "content": "Calculate the first 20 Fibonacci numbers using Python code"}]})` followed by the same print loop |
| CrewAI | Add a second `Task(...)` with `description="Calculate the first 20 Fibonacci numbers using Python code"` and add it to the `Crew(tasks=[...])` list |
| AutoGen | Add a second `await agent.run(task="Calculate the first 20 Fibonacci numbers using Python code")` call after the existing one |
| LlamaIndex | Add a second `await agent.run("Calculate the first 20 Fibonacci numbers using Python code")` call after the existing one |
| Google ADK | Add a second `runner.run_async(...)` call with `types.Part(text="Calculate the first 20 Fibonacci numbers using Python code")` after the existing one |

Print a separator line (e.g. `print("\n--- Sandbox test ---\n")`) between
the two invocations so the output is easy to read.

## Step 6: Update requirements.txt

Read `<agent-dir>/requirements.txt`. If it does not already contain
`httpx`, append `httpx` on a new line. Use `Edit` to add it.

Do NOT modify any existing version pins -- only add new lines.

## Step 6b: Optional -- Add MLflow tracing

If `--with-mlflow` was passed in `$ARGUMENTS`, skip the question and
proceed directly to adding tracing.

Otherwise, ask the user (using AskUserQuestion):

**Do you also want to add MLflow tracing?**

1. **Yes** -- trace every LLM call, tool invocation, and sandbox
   execution with MLflow
2. **No** -- skip tracing, just the sandbox

If the user chose **Yes** (or `--with-mlflow` was set), invoke the
mlflow-tracing skill as a sub-skill:

Run `Skill` with `mlflow-tracing --headless --agent-dir <agent-dir>`

The mlflow-tracing skill will detect the framework, insert the MLflow
init block, and update requirements.txt — all automatically since we
pass `--headless`.

**IMPORTANT**: After the mlflow-tracing skill completes, do NOT stop or
wait for user input. Immediately continue to Step 7. Record that MLflow
was enabled so you can include the MLflow env vars in Step 8a/8b.

If the user chose **No**, skip this step entirely and continue to Step 7.

## Step 7: Ask how to run

Ask the user (using AskUserQuestion):

**How do you want to run the sandboxed agent?**

1. **Locally** -- run the sandbox as a container and agent with Python
2. **On OpenShift** -- deploy the sandbox and agent to the cluster

If `--headless` is set, default to **Locally**.

## Step 8a: Local run path

If the user chose local:

### 8a.1: Clone the sandbox source

Clone the sandbox repo into a temporary directory via Bash:

```bash
SANDBOX_SRC=$(mktemp -d)/code-sandbox
git clone https://github.com/eformat/code-sandbox "$SANDBOX_SRC"
```

Store the `SANDBOX_SRC` path — all subsequent commands use it as
`<sandbox-src>`. Verify the clone succeeded by checking that
`<sandbox-src>/Containerfile` exists.

### 8a.2: Build and start the sandbox container

Detect the container runtime by running `podman --version` via Bash. If
that fails, try `docker --version`. Use whichever is found (prefer
podman). Store the runtime name for subsequent commands.

Check if a container named `code-sandbox` already exists:

```bash
<runtime> ps -a --filter name=^code-sandbox$ --format '{{.Names}}'
```

If it exists, remove it: `<runtime> rm -f code-sandbox`.

Build and start the sandbox:

```bash
<runtime> build -t code-sandbox:latest -f Containerfile <sandbox-src>
<runtime> run -d --name code-sandbox -p 8000:8000 -e SANDBOX_PROFILE=<profile> code-sandbox:latest
```

Where `<profile>` is the sandbox profile from Step 1 (default: `minimal`).

Wait 3 seconds for the container to start, then proceed to verification.

### 8a.3: Run verification tests

Run the six verification tests from Step 9 against `localhost:8000`.
Report pass/fail for each test.

### 8a.4: Provide agent run instructions

Tell the user to set environment variables and run:

```bash
# Model connection (fill in your values)
export OPENAI_API_KEY=<your-key>
export OPENAI_MODEL_NAME=<your-model-name>
export OPENAI_BASE_URL=<your-endpoint-url>

# Sandbox (defaults to localhost:8000, no change needed)
export SANDBOX_URL=http://localhost:8000
```

If **MLflow tracing was enabled** in Step 6b, also include:

```bash
# MLflow tracing
export MLFLOW_TRACKING_INSECURE_TLS=true
export MLFLOW_TRACKING_URI=https://mlflow.redhat-ods-applications.svc.cluster.local:8443
export MLFLOW_WORKSPACE=basic-agents
export MLFLOW_EXPERIMENT_NAME=<agent-name>
export MLFLOW_TRACKING_TOKEN=$(oc whoami -t)
```

Replace `<agent-name>` with a default derived from the agent directory
name (e.g. `./my-agent` -> `my-agent`).

Then:

```bash
cd <agent-dir>
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python agent.py
```

Tell the user:
- The sandbox is running at localhost:8000 with the `<profile>` profile
- The `run_code` tool sends code to `POST /execute`
- If MLflow is enabled, traces will show every LLM call and sandbox
  execution as structured spans in the MLflow UI
- To stop the sandbox: `<runtime> stop code-sandbox`
- Link to full documentation:
  https://agentops.redhatskills.com/security/agent-sandboxing.md

**Stop here** -- do not continue to Step 8b.

## Step 8b: OpenShift deploy path

If the user chose OpenShift:

### 8b.1: Check prerequisites

Run `oc whoami` via Bash. If it fails, tell the user to log in first
(`oc login ...`) and stop.

### 8b.2: Clone the sandbox source

Same as 8a.1 — clone into a temp directory:

```bash
SANDBOX_SRC=$(mktemp -d)/code-sandbox
git clone https://github.com/eformat/code-sandbox "$SANDBOX_SRC"
```

Store the `SANDBOX_SRC` path for subsequent commands (`<sandbox-src>`).

### 8b.3: Ask for project

Ask the user (using AskUserQuestion) what OpenShift project to deploy
the sandbox into. Default: `code-sandbox`.

### 8b.4: Build the sandbox image in-cluster

```bash
oc new-project <project> 2>/dev/null || oc project <project>
```

Check if the build config already exists:
```bash
oc get bc code-sandbox -n <project> 2>/dev/null
```

If it does NOT exist, create it:
```bash
cd <sandbox-src>
oc new-build --name=code-sandbox --binary --strategy=docker -n <project>
oc patch bc/code-sandbox -n <project> \
  -p '{"spec":{"strategy":{"dockerStrategy":{"dockerfilePath":"Containerfile"}}}}'
```

Start the build:
```bash
cd <sandbox-src>
oc start-build code-sandbox --from-dir=. -n <project> --follow
```

### 8b.5: Deploy the sandbox with Helm

Check if Helm is available: `helm version` via Bash. If not available,
tell the user to install Helm and stop.

Check if the release already exists:
```bash
helm status code-sandbox -n <project> 2>/dev/null
```

If it exists, upgrade; otherwise install:

```bash
cd <sandbox-src>
helm install code-sandbox ./chart \
  -f chart/values-standalone.yaml \
  --set image.repository=image-registry.openshift-image-registry.svc:5000/<project>/code-sandbox \
  --set image.tag=latest \
  --set profile=<profile> \
  -n <project>
```

(Use `helm upgrade` instead of `helm install` if the release exists.)

Wait for rollout:
```bash
oc rollout status deployment/code-sandbox -n <project> --timeout=120s
```

### 8b.6: Run verification tests

Run the six verification tests from Step 9, using the OpenShift variant
with `oc run` ephemeral pods against
`code-sandbox.<project>.svc:8000`.

### 8b.7: Deploy the agent

Tell the user the sandbox is now running. 

If **MLflow tracing was enabled** in Step 6b, grant the pod's service
account access to the MLflow operator gateway before deploying:

```bash
oc create rolebinding agent-mlflow \
  --clusterrole=mlflow-operator-mlflow-integration \
  --serviceaccount=<project>:default \
  -n <project> 2>/dev/null || true
```

Then invoke the agent-deploy-openshift skill:

Run `Skill` with `agent-deploy-openshift --agent-dir <agent-dir>`

Tell the user that when the deploy skill asks for environment variables
in its Step 6, they should add:

```
--env SANDBOX_URL=http://code-sandbox.<project>.svc:8000
```

If **MLflow tracing was enabled**, also add:

```
--env MLFLOW_TRACKING_URI=https://mlflow.redhat-ods-applications.svc.cluster.local:8443
--env MLFLOW_WORKSPACE=basic-agents
--env MLFLOW_EXPERIMENT_NAME=<agent-name>
--env MLFLOW_TRACKING_TOKEN_FILE=/var/run/secrets/kubernetes.io/serviceaccount/token
--env MLFLOW_TRACKING_INSECURE_TLS=true
```

The agent pod needs the `code-sandbox-client: "true"` label to pass the
sandbox's NetworkPolicy. Tell the user to add it to their pod:

```
--labels="code-sandbox-client=true"
```

Link to full documentation:
https://agentops.redhatskills.com/security/agent-sandboxing.md

## Step 9: Verification tests

This step is called inline from Step 8a.3 or Step 8b.6 -- not as a
standalone step. Run these six tests and report pass/fail for each.

### For local runs (localhost:8000)

Run each test via Bash and check the response:

```bash
# Test 1: Health check
curl -sf http://localhost:8000/healthz
# Expected: {"status":"ok"}

# Test 2: Profile check
curl -sf http://localhost:8000/profile
# Expected: JSON with "name", "allowed_imports" fields

# Test 3: Success case -- math computation
curl -sf -X POST http://localhost:8000/execute \
  -H 'Content-Type: application/json' \
  -d '{"code":"import math\nprint(f\"pi = {math.pi}\")"}'
# Expected: "stdout" contains "pi = 3.14", "exit_code": 0

# Test 4: AST rejection -- eval() is blocked
curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:8000/execute \
  -H 'Content-Type: application/json' \
  -d '{"code":"eval(\"1+1\")"}'
# Expected: HTTP 400

# Test 5: Import rejection -- subprocess is blocked
curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:8000/execute \
  -H 'Content-Type: application/json' \
  -d '{"code":"import subprocess"}'
# Expected: HTTP 400

# Test 6: Timeout -- infinite loop killed
curl -sf -X POST http://localhost:8000/execute \
  -H 'Content-Type: application/json' \
  -d '{"code":"while True: pass","timeout":2}'
# Expected: "timed_out": true
```

### For OpenShift runs

Use `oc run` ephemeral pods with the `code-sandbox-client=true` label
(required by the NetworkPolicy). Replace `<project>` and
`<sandbox-svc>` appropriately:

```bash
# Test 1: Health check
oc run test-sandbox --rm -i --restart=Never \
  --labels="code-sandbox-client=true" \
  --image=registry.access.redhat.com/ubi9/ubi-minimal:latest \
  -n <project> -- \
  curl -sf http://code-sandbox.<project>.svc:8000/healthz
```

Use the same pattern for each test, replacing the curl command with the
appropriate test from the local list above.

### Reporting

After running all six tests, print a summary table:

```
Sandbox verification:
  1. Health check       ✓ passed
  2. Profile check      ✓ passed
  3. Success case       ✓ passed
  4. AST rejection      ✓ passed
  5. Import rejection   ✓ passed
  6. Timeout            ✓ passed
```

If any test fails, show the actual response and suggest checking the
sandbox container logs (`<runtime> logs code-sandbox` or
`oc logs deployment/code-sandbox -n <project>`).

$ARGUMENTS
