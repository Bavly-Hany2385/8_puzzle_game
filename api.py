from fastapi import FastAPI
from pydantic import BaseModel

from bfs import bfs as bfs_search
from dfs import dfs as dfs_search
from AStar import A_star
from iterative_dfs import dfs as iterative_dfs


app = FastAPI()
@app.get("/")
async def root(name: str="World"):
    return {"greeting": f"Hello, {name}!"}



class SolveRequest(BaseModel):
    start_node: list[int]
    goal_node: list[int]
    algorithm: str
    heuristic: str = "manhattan"


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
    elif request.algorithm == "iterative_dfs":
        solver = iterative_dfs
        path = solver(start, goal )
    elif request.algorithm == "a_star":
        solver = A_star
        path = solver(start, goal, heuristic=request.heuristic)
  
    return {
        "path": path,
        "cost": len(path) - 1 if path else None
    }