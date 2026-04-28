---
name: crewai-agent
description: Scaffold a basic CrewAI agent with a tool, wired to any OpenAI-compatible endpoint. Run when the user asks to create, generate, or scaffold a CrewAI agent.
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

You are an agent scaffolding assistant. Your job is to generate a working
CrewAI agent based on the hello-world pattern from
https://agentops.redhatskills.com/basic-agents/hello-world.md.

CrewAI uses role-based agents orchestrated through a Crew. Each Agent has a
role, goal, and backstory. Tools are registered with the `@tool` decorator.
It connects to any OpenAI-compatible endpoint (OpenAI, vLLM, Ollama, RHOAI
Model-as-a-Service) via environment variables using LiteLLM under the hood.

## Step 1: Gather Requirements

Parse `$ARGUMENTS` for:
- `--output-dir <path>`: Directory to write files into (default: current directory `.`)
- `--tool-name <name>`: Name of the example tool to scaffold (default: `get_weather`)
- `--headless`: Skip clarifying questions and use all defaults

If `--headless` is NOT set, ask the user (using AskUserQuestion) at most 3 questions:

1. **Where should the files be written?** (directory path — default `.`)
2. **What should the example tool do?** Describe it in plain English so you can write a realistic stub. (default: return fake weather for a city)
3. **What model / endpoint will you use?** OpenAI, a local vLLM/Ollama server, or RHOAI Model-as-a-Service? (affects the env var instructions in the README)

## Step 2: Write `agent.py`

Write `<output-dir>/agent.py` with this structure:

```python
"""
Basic CrewAI agent.

Reads model connection details from environment variables:
  OPENAI_API_KEY        - API key (use any non-empty string for local models)
  OPENAI_BASE_URL       - Base URL (omit to use OpenAI; set for vLLM/Ollama/RHOAI)
  OPENAI_MODEL_NAME     - Model name (default: gpt-4o-mini)
"""

__import__("pysqlite3")
import sys
sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")

import os
from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

@tool("<tool_name>")
def <tool_name>(<param>: str) -> str:
    """<docstring describing what the tool does — this becomes the LLM's tool description>"""
    # TODO: replace this stub with a real implementation
    return f"<stub response for {<param>}>"


# ---------------------------------------------------------------------------
# Agent setup
# ---------------------------------------------------------------------------

llm = LLM(
    model=f"openai/{os.environ.get('OPENAI_MODEL_NAME', 'gpt-4o-mini')}",
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)

agent = Agent(
    role="<role based on the tool>",
    goal="<goal describing when to use the tool>",
    backstory="You are a helpful assistant. Always use your tools "
              "to get data, then write a clear summary as your final answer.",
    llm=llm,
    tools=[<tool_name>],
    max_iter=5,
    max_retry_limit=3,
)

task = Task(
    description="<default question that exercises the tool>",
    expected_output="A single sentence summary of the result.",
    agent=agent,
)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    crew = Crew(agents=[agent], tasks=[task])
    result = crew.kickoff()
    print(result.raw)
```

Fill in the blanks (`<tool_name>`, `<param>`, `<docstring>`, `<role>`, `<goal>`, etc.) from the
user's answers or defaults. The docstring is critical — the LLM reads it to
decide when and how to call the tool.

## Step 3: Write `requirements.txt`

Write `<output-dir>/requirements.txt`:

```
crewai[litellm]>=0.121
pysqlite3-binary
```

## Step 4: Write `README.md`

Write `<output-dir>/README.md` with:

1. **What this is** — one sentence.
2. **Install** — `pip install -r requirements.txt`
3. **Configure** — env var table:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `OPENAI_API_KEY` | Yes | API key. Use any non-empty string for local models. |
   | `OPENAI_BASE_URL` | No | Base URL for OpenAI-compatible endpoints. Omit for OpenAI. |
   | `OPENAI_MODEL_NAME` | No | Model name. Default: `gpt-4o-mini`. |

   Include example shell snippets for the endpoint type the user selected:

   **OpenAI:**
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

   **Local model (vLLM / Ollama / RHOAI):**
   ```bash
   export OPENAI_API_KEY=unused      # any non-empty value
   export OPENAI_BASE_URL=http://localhost:8000/v1
   export OPENAI_MODEL_NAME=llama3.1
   ```

4. **Run** — `python agent.py`
5. **How it works** — 3-4 sentences explaining CrewAI's approach: you define Agents
   with roles and goals, assign them Tasks, and orchestrate them through a Crew.
   Tools are Python functions decorated with `@tool`. The agent reasons about
   which tool to call, executes it, and uses the result to produce a final answer.
6. **Next steps** — bullet list:
   - Add more tools (decorate any Python function with `@tool`)
   - Add more agents with different roles and chain tasks between them
   - Connect to tracing: https://agentops.redhatskills.com/tracing/connect-to-mlflow.md
   - Deploy on OpenShift: see https://agentops.redhatskills.com/basic-agents/hello-world.md

## Step 5: Confirm

Tell the user:
- Which files were written and where
- The exact commands to install and run the agent
- That they can replace the stub tool body with a real implementation and add more tools by decorating functions with `@tool`

$ARGUMENTS
