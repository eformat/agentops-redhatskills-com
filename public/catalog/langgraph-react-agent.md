import { Demo } from '@/components/Demo'
import { CodeBlock } from '@/components/CodeBlock'
import { QuickNav } from '@/components/QuickNav'
import { MarkdownLink } from '@/components/MarkdownLink'
import {
  quickNavItems,
  reactAgentFiles, envOpenaiHighlighted, envLocalHighlighted, sampleOutputHighlighted,
} from './code-examples'

<QuickNav items={quickNavItems} />

<div style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>

# LangGraph ReAct Agent

<p className="MdSubtitle">
  The simplest possible ReAct agent in one Python file.
  <MarkdownLink />
</p>

A ReAct (Reasoning + Acting) agent works in a loop: the LLM **reasons** about
what to do, **acts** by calling a tool, **observes** the result, then repeats
until it has an answer. LangGraph's `create_react_agent` gives you this loop
out of the box — no manual graph wiring needed.

This page walks through a single-file "hello world" agent that has one tool
and answers one question. The same code works with OpenAI, any
OpenAI-compatible endpoint (vLLM, Ollama, RHOAI Model-as-a-Service), or a
locally hosted model — just change the environment variables.

## The Code

<Demo files={reactAgentFiles} defaultCollapsed={false}>
  <div className="DemoPreviewText">
    <strong className="MdStrong">create_react_agent()</strong>
    <span> — A complete ReAct agent in 15 lines</span>
  </div>
</Demo>

That's the entire agent. The `ChatOpenAI` constructor reads `OPENAI_API_KEY`,
`OPENAI_BASE_URL`, and the model name from environment variables, so the same
code works against any backend without changes.

## How it works

### ReAct loop

When you call `agent.invoke()`, LangGraph runs this cycle:

1. The LLM sees the user message and the list of available tools.
2. If the LLM decides it needs information, it emits a **tool call** (e.g. `get_weather("Portland")`).
3. LangGraph executes the tool and feeds the result back to the LLM.
4. The LLM either calls another tool or returns a **final answer**.

The loop ends when the LLM responds with plain text instead of a tool call.

### Tools

A tool is any Python function with a docstring. LangGraph converts it to an
OpenAI-compatible function schema automatically. The function name becomes the
tool name, the docstring becomes the description, and type hints become the
parameter schema.

```python
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"Sunny, 72 F in {city}."
```

Add more tools by passing them in the list:

```python
agent = create_react_agent(llm, tools=[get_weather, search_docs, run_query])
```

## Running it

```bash
pip install langgraph langchain-openai
```

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

Then run:

```bash
python react_agent.py
```

<CodeBlock title="Sample output">{sampleOutputHighlighted}</CodeBlock>

</div>
