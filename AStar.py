import helpers as help
import heapq
from heuristics import manhattan_heuristic, euclidean_heuristic
import TreeRecorder

def A_star(start_node, goal_node , heuristic="manhattan"):
    record = TreeRecorder.TreeRecorder() 
    start_id = record.add(start_node, parent=None) 
    
    pq = []
    h_start = 0
    if heuristic == "manhattan":
        h_start = manhattan_heuristic(start_node, goal_node)
    elif heuristic == "euclidean":
        h_start = euclidean_heuristic(start_node, goal_node)
        
    heapq.heappush(pq, (h_start, 0 , start_node, start_id))  # (f , g , node, node_id) ( f(n) = g(n) + h(n) )

    cost_so_far = {start_node: 0}
    
    while pq:
        priority , g , state, node_id = heapq.heappop(pq)
        
        if state == goal_node:
            return record.path_to_root(node_id), record.export_tree(node_id)
        
        if g > cost_so_far.get(state, float("inf")): # like Dijkstra's algorithm, we skip processing if we have already found a better path to this state
            continue # the heap may contain multiple entries for the same state, but we only wanna process the one with the lowest cost matches the cost_so_far for that state
            
        children = help.generate_children(state)

        for child, move in children:
            new_cost = g + 1
            if child not in cost_so_far or new_cost < cost_so_far.get(child, float("inf")):
                cost_so_far[child] = new_cost
                
                child_id = record.add(child, parent=node_id, move=move)
                
                h = manhattan_heuristic(child, goal_node) if heuristic == "manhattan" else euclidean_heuristic(child, goal_node)
                heapq.heappush(pq, (h + new_cost,  new_cost , child, child_id))

    return None, []

if __name__ == "__main__":
    start_node = (1,0,2,7,5,4,8,6,3) 
    goal_node = (0,1,2,3,4,5,6,7,8)
    
    path, tree = A_star(start_node, goal_node, heuristic="manhattan")
    if path:
        for state in path:
            state_2d = [state[i:i+3] for i in range(0, len(state), 3)]
            for row in state_2d:
                print(row)
            print("\n")