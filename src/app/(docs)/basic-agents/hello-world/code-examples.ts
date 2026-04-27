import { highlight } from '@/utils/highlight';

export const quickNavItems = [
  { id: 'how-it-works', text: 'How it works', level: 2 },
  { id: 'running-it', text: 'Running it', level: 2 },
  { id: 'openai', text: 'OpenAI', level: 3 },
  { id: 'local-or-hosted-model', text: 'Local or hosted model', level: 3 },
  { id: 'agent-frameworks', text: 'Agent Frameworks', level: 2 },
  { id: 'langgraph', text: 'LangGraph', level: 3 },
  { id: 'crewai', text: 'CrewAI', level: 3 },
  { id: 'autogen', text: 'AutoGen', level: 3 },
  { id: 'llamaindex', text: 'LlamaIndex', level: 3 },
  { id: 'google-adk', text: 'Google ADK', level: 3 },
  { id: 'deploy-on-openshift', text: 'Deploy on OpenShift', level: 2 },
  { id: 'build-the-image', text: 'Build the image', level: 3 },
  { id: 'export-env-vars', text: 'Export env vars', level: 3 },
  { id: 'run-the-agent', text: 'Run the agent', level: 3 },
  { id: 'check-the-logs', text: 'Check the logs', level: 3 },
  { id: 'clean-up', text: 'Clean up', level: 3 },
];

// ── LangGraph ────────────────────────────────────────────────────

const langgraphCode = `"""Hello World ReAct agent — LangGraph."""

import os
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent


def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"The weather in {city} is sunny, 72 F."


llm = ChatOpenAI(
    model=os.environ.get("OPENAI_MODEL_NAME", "gpt-4o-mini"),
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)
agent = create_react_agent(llm, tools=[get_weather])

result = agent.invoke(
    {"messages": [{"role": "user", "content": "What's the weather in Portland?"}]}
)

for msg in result["messages"]:
    print(f"{msg.type}: {msg.content}")
`;

const langgraphReqs = `langgraph>=0.4
langchain-openai>=0.3`;

// ── CrewAI ───────────────────────────────────────────────────────

const crewaiCode = `"""Hello World agent — CrewAI."""

__import__("pysqlite3")
import sys
sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")

import os
from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool


@tool("get_weather")
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"The weather in {city} is sunny, 72 F."


llm = LLM(
    model=f"openai/{os.environ.get('OPENAI_MODEL_NAME', 'gpt-4o-mini')}",
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)

agent = Agent(
    role="Weather Reporter",
    goal="Look up weather using the get_weather tool and summarize the result",
    backstory="You are a helpful weather assistant. Always use your tools "
              "to get data, then write a clear summary as your final answer.",
    llm=llm,
    tools=[get_weather],
    max_iter=5,
    max_retry_limit=3,
)

task = Task(
    description="What is the weather in Portland? Use the get_weather tool "
                "to find out, then respond with a one-sentence summary.",
    expected_output="A single sentence like: The weather in Portland is ...",
    agent=agent,
)

crew = Crew(agents=[agent], tasks=[task])
result = crew.kickoff()
print(result.raw)
`;

const crewaiReqs = `crewai[litellm]>=0.121
pysqlite3-binary`;

// ── AutoGen ──────────────────────────────────────────────────────

const autogenCode = `"""Hello World agent — AutoGen."""

import os
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient


def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"The weather in {city} is sunny, 72 F."


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
    name="weather_agent",
    model_client=model_client,
    tools=[get_weather],
)


async def main():
    result = await agent.run(task="What's the weather in Portland?")
    print(result.messages[-1].content)


asyncio.run(main())
`;

const autogenReqs = `autogen-agentchat>=0.4
autogen-ext[openai]>=0.4`;

// ── LlamaIndex ───────────────────────────────────────────────────

const llamaindexCode = `"""Hello World ReAct agent — LlamaIndex."""

import os
import asyncio
from llama_index.core.agent.workflow import AgentWorkflow, ReActAgent
from llama_index.core.tools import FunctionTool
from llama_index.llms.openai_like import OpenAILike


def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"The weather in {city} is sunny, 72 F."


llm = OpenAILike(
    model=os.environ.get("OPENAI_MODEL_NAME", "gpt-4o-mini"),
    api_base=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
    is_chat_model=True,
    is_function_calling_model=False,
    context_window=128000,
)

react_agent = ReActAgent(
    name="weather_agent",
    description="Looks up the weather",
    tools=[FunctionTool.from_defaults(fn=get_weather)],
    llm=llm,
)

agent = AgentWorkflow(agents=[react_agent], root_agent="weather_agent")


async def main():
    response = await agent.run("What's the weather in Portland?")
    print(response)


asyncio.run(main())
`;

const llamaindexReqs = `llama-index>=0.12
llama-index-llms-openai-like>=0.4`;

// ── Google ADK ───────────────────────────────────────────────────

const adkCode = `"""Hello World agent — Google ADK."""

import os
import asyncio
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"The weather in {city} is sunny, 72 F."


model = LiteLlm(
    model=f"openai/{os.environ.get('OPENAI_MODEL_NAME', 'gpt-4o-mini')}",
    api_base=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY"),
)

agent = Agent(
    name="weather_agent",
    model=model,
    description="A helpful weather assistant",
    instruction="Help users check the weather. "
                "Use the get_weather tool when asked.",
    tools=[get_weather],
)

session_service = InMemorySessionService()
runner = Runner(
    agent=agent, app_name="weather_app",
    session_service=session_service,
)


async def main():
    session = await session_service.create_session(
        app_name="weather_app", user_id="user1",
    )
    message = types.Content(
        role="user",
        parts=[types.Part(text="What's the weather in Portland?")],
    )
    async for event in runner.run_async(
        user_id="user1", session_id=session.id,
        new_message=message,
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)


asyncio.run(main())
`;

const adkReqs = `google-adk>=1.2
litellm`;

// ── Env vars ─────────────────────────────────────────────────────

const envOpenai = `export OPENAI_API_KEY="sk-..."`;

const envLocal = `# Any OpenAI-compatible endpoint: vLLM, Ollama, RHOAI MaaS, etc.
export OPENAI_BASE_URL="http://maas.apps.my-cluster.example.com/v1"
export OPENAI_MODEL_NAME="gemma4"
export OPENAI_API_KEY="your-token-here"`;

const envAdk = `export GOOGLE_API_KEY="your-gemini-api-key"`;

const sampleOutput = `human: What's the weather in Portland?
ai:
tool: The weather in Portland is sunny, 72 F.
ai: The weather in Portland is currently sunny and 72 F.`;

// ── Exports ──────────────────────────────────────────────────────

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

// ── OpenShift deployment ─────────────────────────────────────────

const buildSteps = `# Create the Dockerfile
cat <<'EOF' > Dockerfile
# build
FROM registry.access.redhat.com/ubi9/python-312:latest as builder
USER 0
ADD app-src /tmp/src
RUN /usr/bin/fix-permissions /tmp/src
USER 1001
RUN /usr/libexec/s2i/assemble
# deploy
FROM registry.access.redhat.com/ubi9/python-312-minimal:latest
COPY --from=builder /opt/app-root /opt/app-root
USER 1001
CMD ["python", "agent.py"]
EOF

# Copy source files into app-src/
mkdir app-src
cp agent.py app-src/agent.py
cp requirements.txt app-src/requirements.txt

# Create an OpenShift project (you must be logged in)
oc new-project basic-agents

# Create a binary build config
oc -n basic-agents new-build --binary --name=agent

# Start the build and follow the logs
oc -n basic-agents start-build agent --from-dir=. --follow`;

const exportEnvVars = `export OPENAI_API_KEY=<your-key>
export OPENAI_MODEL_NAME=<your-model>
export OPENAI_BASE_URL=<your-endpoint>`;

const runAgent = `oc -n basic-agents run agent \\
  --restart=Never \\
  --image=image-registry.openshift-image-registry.svc:5000/basic-agents/agent:latest \\
  --env OPENAI_API_KEY=$OPENAI_API_KEY \\
  --env OPENAI_MODEL_NAME=$OPENAI_MODEL_NAME \\
  --env OPENAI_BASE_URL=$OPENAI_BASE_URL`;

const checkLogs = `oc -n basic-agents logs agent`;

const cleanUp = `oc -n basic-agents delete bc,is,pod agent`;

export const buildStepsHighlighted = highlight(buildSteps);
export const exportEnvVarsHighlighted = highlight(exportEnvVars);
export const runAgentHighlighted = highlight(runAgent);
export const checkLogsHighlighted = highlight(checkLogs);
export const cleanUpHighlighted = highlight(cleanUp);

export const envOpenaiHighlighted = highlight(envOpenai);
export const envLocalHighlighted = highlight(envLocal);
export const envAdkHighlighted = highlight(envAdk);
export const sampleOutputHighlighted = highlight(sampleOutput);
