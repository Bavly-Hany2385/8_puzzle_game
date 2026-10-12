import helpers as help
import heapq
from heuristics import manhattan_heuristic, euclidean_heuristic

def bfs(start_node, goal_node , heuristic="Manhattan"):
    def heuristic(state):
        return sum(
            1 for i in range(9) if state[i] != 0 and state[i] != goal_node[i]
        )
    pq = []
    h_start = heuristic(start_node)
    heapq.heappush(pq, (h_start, 0 , start_node ))  # (f , g , node) ( f(n) = g(n) + h(n) )

    parent_map = {start_node: None}
    cost_so_far = {start_node: 0}
    
    
    while pq:
        priority , g , state  = heapq.heappop(pq) 
        if state == goal_node:
            return help.get_path(state, parent_map)
        
        if g > cost_so_far.get(state, float("inf")): # like Dijkstra's algorithm, we skip processing if we have already found a better path to this state
            continue # the heap may contain multiple entries for the same state, but we only wanna process the one with the lowest cost matches the cost_so_far for that state
        children = help.generate_children(state)


        for child in children:
            new_cost = g + 1
            if child not in cost_so_far or new_cost < cost_so_far.get(child, float("inf")):
                cost_so_far[child] = new_cost
                parent_map[child] = state
                
                h = manhattan_heuristic(child, goal_node) if heuristic == "manhattan" else euclidean_heuristic(child, goal_node)
                heapq.heappush(pq, (h + new_cost,  new_cost , child))

    return None

if __name__ == "__main__":
    start_node = (1,0,2,7,5,4,8,6,3) 
    goal_node = (0,1,2,3,4,5,6,7,8)
    
    path = bfs(start_node, goal_node, heuristic="manhattan")
    
    for state in path:
        state_2d = [state[i:i+3] for i in range(0, len(state), 3)]
        for row in state_2d:
            print(row)
        print("\n")
        