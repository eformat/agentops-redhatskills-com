---
name: langchain-agent
description: Scaffold a basic LangChain/LangGraph ReAct agent with a tool, wired to any OpenAI-compatible endpoint. Run when the user asks to create, generate, or scaffold a LangChain or LangGraph agent.
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

You are an agent scaffolding assistant. Your job is to generate a working
LangGraph ReAct agent based on the hello-world pattern from
https://agentops.redhatskills.com/basic-agents/hello-world.md.

The agent uses `create_react_agent` — a single function that wires one or more
Python tools into a reason → act → observe loop. It connects to any
OpenAI-compatible endpoint (OpenAI, vLLM, Ollama, RHOAI Model-as-a-Service)
via environment variables.

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
Basic LangGraph ReAct agent.

Reads model connection details from environment variables:
  OPENAI_API_KEY   - API key (use any non-empty string for local models)
  OPENAI_BASE_URL  - Base URL (omit to use OpenAI; set for vLLM/Ollama/RHOAI)
  MODEL_NAME       - Model name (default: gpt-4o-mini)
"""

import os
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

def <tool_name>(<param>: str) -> str:
    """<docstring describing what the tool does — this becomes the LLM's tool description>"""
    # TODO: replace this stub with a real implementation
    return f"<stub response for {<param>}>"


# ---------------------------------------------------------------------------
# Agent setup
# ---------------------------------------------------------------------------

model = ChatOpenAI(
    model=os.environ.get("MODEL_NAME", "gpt-4o-mini"),
    # OPENAI_API_KEY and OPENAI_BASE_URL are read from the environment automatically
)

tools = [<tool_name>]

agent = create_react_agent(model, tools)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    user_message = "<default question that exercises the tool>"
    print(f"Question: {user_message}\n")

    result = agent.invoke({"messages": [("user", user_message)]})

    # The final answer is the last message in the conversation
    final = result["messages"][-1].content
    print(f"Answer: {final}")
```

Fill in the blanks (`<tool_name>`, `<param>`, `<docstring>`, etc.) from the
user's answers or defaults. The docstring is critical — the LLM reads it to
decide when and how to call the tool.

## Step 3: Write `requirements.txt`

Write `<output-dir>/requirements.txt`:

```
langchain-openai>=0.3
langgraph>=0.3
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
   | `MODEL_NAME` | No | Model name. Default: `gpt-4o-mini`. |

   Include example shell snippets for the endpoint type the user selected:

   **OpenAI:**
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

   **Local model (vLLM / Ollama / RHOAI):**
   ```bash
   export OPENAI_API_KEY=unused      # any non-empty value
   export OPENAI_BASE_URL=http://localhost:8000/v1
   export MODEL_NAME=llama3.1
   ```

4. **Run** — `python agent.py`
5. **How it works** — 3-4 sentences explaining the ReAct loop: the LLM sees the
   tool list, emits a tool call when it needs information, the framework
   executes the tool and feeds the result back, the LLM returns a final answer.
6. **Next steps** — bullet list:
   - Add more tools (any Python function with a docstring)
   - Connect to tracing: https://agentops.redhatskills.com/tracing/connect-to-mlflow.md
   - Deploy on OpenShift: see https://agentops.redhatskills.com/basic-agents/hello-world.md

## Step 5: Confirm

Tell the user:
- Which files were written and where
- The exact commands to install and run the agent
- That they can replace the stub tool body with a real implementation and add more tools by adding functions to the `tools` list

$ARGUMENTS
