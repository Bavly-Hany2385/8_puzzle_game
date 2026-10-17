from fastapi import FastAPI
from enum import Enum
from pydantic import BaseModel

from bfs import bfs as bfs_search
from dfs import dfs as dfs_search
from AStar import A_star
from iterative_deepening import iterative_deepening as depth_limited_search

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root(name: str="World"):
    return {"greeting": f"Hello, {name}!"}


class Heuristic(str, Enum):
    manhattan = "manhattan"
    euclidean = "euclidean"
class SolveRequest(BaseModel):
    start_node: list[int]
    goal_node: list[int]
    algorithm: str
    heuristic: Heuristic = "manhattan"


@app.post("/solve")
def solve(request: SolveRequest):
    start = tuple(request.start_node)
    goal = tuple(request.goal_node)

    if request.algorithm == "bfs":
        solver = bfs_search
        path = solver(start, goal)
    elif request.algorithm == "dfs":
        solver = dfs_search
        path = solver(start, goal , None, None)
    elif request.algorithm == "iterative_deepening":
        solver = depth_limited_search
        path = solver(start, goal, max_depth=100)
    elif request.algorithm == "a_star":
        solver = A_star
        path = solver(start, goal, heuristic=request.heuristic)
    else:
        return {"error": "Invalid algorithm specified."}
    return {
        "path": path,
        "cost": len(path) - 1 if path else None
    }