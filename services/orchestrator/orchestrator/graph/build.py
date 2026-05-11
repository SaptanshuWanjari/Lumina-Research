from __future__ import annotations

from langgraph.graph import END, StateGraph

from orchestrator.graph.nodes import (
    analyzer_node,
    human_review_node,
    planner_node,
    publish_node,
    retriever_node,
    writer_node,
)
from orchestrator.graph.state import OrchestratorState


def build_graph(checkpointer: object):
    graph = StateGraph(OrchestratorState)
    graph.add_node("planner", planner_node)
    graph.add_node("retriever", retriever_node)
    graph.add_node("analyzer", analyzer_node)
    graph.add_node("writer", writer_node)
    graph.add_node("human_review", human_review_node)
    graph.add_node("publish", publish_node)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "retriever")
    graph.add_edge("retriever", "analyzer")
    graph.add_edge("analyzer", "writer")
    graph.add_edge("writer", "human_review")
    graph.add_edge("human_review", "publish")
    graph.add_edge("publish", END)
    return graph.compile(checkpointer=checkpointer)
