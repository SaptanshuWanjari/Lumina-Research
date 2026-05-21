from __future__ import annotations

from langgraph.graph import END, StateGraph

from orchestrator.graph.nodes import deep_research_node, human_review_node, publish_node
from orchestrator.graph.state import OrchestratorState


def build_graph(checkpointer: object):
    graph = StateGraph(OrchestratorState)
    graph.add_node("deep_research", deep_research_node)
    graph.add_node("human_review", human_review_node)
    graph.add_node("publish", publish_node)

    graph.set_entry_point("deep_research")
    graph.add_edge("deep_research", "human_review")
    graph.add_edge("human_review", "publish")
    graph.add_edge("publish", END)
    return graph.compile(checkpointer=checkpointer)
