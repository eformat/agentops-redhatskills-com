import { Demo } from '@/components/Demo'
import { CodeBlock } from '@/components/CodeBlock'
import { QuickNav } from '@/components/QuickNav'
import { FrameworkCards } from '@/components/FrameworkCards'
import { MarkdownLink } from '@/components/MarkdownLink'
import {
  quickNavItems,
  langgraphFiles, crewaiFiles, autogenFiles, llamaindexFiles, adkFiles,
  envOpenaiHighlighted, envLocalHighlighted, sampleOutputHighlighted,
  buildStepsHighlighted, exportEnvVarsHighlighted, runAgentHighlighted, checkLogsHighlighted, cleanUpHighlighted,
} from './code-examples'

<QuickNav items={quickNavItems} />

<div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>

# Hello World Agent

<p className="MdSubtitle">
  One tool, one question, one file — the same agent in every framework.
  <MarkdownLink />
</p>

Every example on this page builds the same agent: a `get_weather` tool wired
to an LLM in a ReAct loop. The LLM **reasons** about what to do, **acts** by
calling the tool, **observes** the result, then returns a final answer.

The same code works with OpenAI, any OpenAI-compatible endpoint (vLLM, Ollama,
RHOAI Model-as-a-Service), or a locally hosted model — just change the
environment variables. Pick your framework below to jump to a working example.

<FrameworkCards />

## How it works

Every framework implements the same loop under different abstractions:

1. The LLM sees the user message and the list of available tools.
2. If the LLM decides it needs information, it emits a **tool call** (e.g. `get_weather("Portland")`).
3. The framework executes the tool and feeds the result back to the LLM.
4. The LLM either calls another tool or returns a **final answer**.

A tool is any Python function with a docstring. The framework converts it to a
function schema automatically — the function name becomes the tool name, the
docstring becomes the description, and type hints become the parameter schema.

## Running it

Each example reads model connection details from environment variables.
Install the framework's dependencies (shown in the `requirements.txt` tab),
set the env vars below, and run `python agent.py`.

### OpenAI

<CodeBlock title="Environment variables">{envOpenaiHighlighted}</CodeBlock>

### Local or hosted model

Any OpenAI-compatible API works — vLLM, Ollama, RHOAI Model-as-a-Service,
LM Studio, or any other server that implements the
`/v1/chat/completions` endpoint with tool calling support.

<CodeBlock title="Environment variables">{envLocalHighlighted}</CodeBlock>

The model must support **tool calling** (function calling) for the ReAct loop
to work. Models known to work: Gemma 4, Llama 4 Scout, Llama 3.1+,
Mistral Instruct v0.3+, Qwen 2.5+.

<CodeBlock title="Sample output">{sampleOutputHighlighted}</CodeBlock>

## Agent Frameworks

### LangGraph

[LangChain](https://python.langchain.com/) provides `create_agent` — a
one-liner that wires tools into the reason → act → observe loop. It
accepts a `ChatOpenAI` instance, which reads `OPENAI_API_KEY` and
`OPENAI_BASE_URL` from the environment automatically. Under the hood,
agents are compiled as [LangGraph](https://langchain-ai.github.io/langgraph/)
graphs.

<Demo files={langgraphFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">create_agent()</strong>
    <span> — ReAct loop in one function call</span>
  </div>
</Demo>

### CrewAI

[CrewAI](https://www.crewai.com/) models agents as role-playing team members.
Even for a single agent, you define a role, goal, and backstory. Tools are
decorated with `@tool`. The `LLM` wrapper accepts an `openai/` model prefix
to target any OpenAI-compatible endpoint.

<Demo files={crewaiFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">Crew + Agent + Task</strong>
    <span> — Role-based agent with tool use</span>
  </div>
</Demo>

### AutoGen

[AutoGen](https://microsoft.github.io/autogen/) uses an async-first design.
An `AssistantAgent` wraps a model client and a list of tools — call
`agent.run()` to execute. The `OpenAIChatCompletionClient` connects to any
OpenAI-compatible endpoint.

<Demo files={autogenFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">AssistantAgent + run()</strong>
    <span> — Async agent with tool calling</span>
  </div>
</Demo>

### LlamaIndex

[LlamaIndex](https://www.llamaindex.ai/) uses `AgentWorkflow` with an
explicit `ReActAgent` for text-based tool calling — more reliable than
function calling with non-OpenAI models. Use `OpenAILike` instead of
`OpenAI` for custom model names — it accepts any OpenAI-compatible
endpoint via `api_base`.

<Demo files={llamaindexFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">ReActAgent + AgentWorkflow</strong>
    <span> — Text-based ReAct loop with OpenAILike</span>
  </div>
</Demo>

### Google ADK

[Google Agent Development Kit](https://google.github.io/adk-docs/) builds
agents using Gemini models natively, but supports any OpenAI-compatible
endpoint via its `LiteLlm` integration. The `openai/` model prefix tells
LiteLLM to use the OpenAI chat completions API. Tools are plain Python
functions passed to the `Agent` constructor.

<Demo files={adkFiles} defaultCollapsed={true}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">Agent + LiteLlm + Runner</strong>
    <span> — Async agent via LiteLLM</span>
  </div>
</Demo>

## Deploy on OpenShift

You can build and run any of the agents above on OpenShift using a UBI 9
Python 3.12 multi-stage build. The Dockerfile uses S2I `assemble` to install
dependencies in a builder stage, then copies the virtual environment into a
minimal runtime image.

### Build the image

Create the Dockerfile, copy your `agent.py` and `requirements.txt` into an
`app-src/` folder, create a binary BuildConfig, and start the build:

<CodeBlock title="Build steps">{buildStepsHighlighted}</CodeBlock>

### Export env vars

Set your model connection details before creating the pod:

<CodeBlock title="Environment variables">{exportEnvVarsHighlighted}</CodeBlock>

### Run the agent

Once the build completes, run the agent as a one-shot pod:

<CodeBlock title="Run the agent">{runAgentHighlighted}</CodeBlock>

### Check the logs

<CodeBlock title="Pod logs">{checkLogsHighlighted}</CodeBlock>

### Clean up

<CodeBlock title="Delete build and pod">{cleanUpHighlighted}</CodeBlock>

</div>
