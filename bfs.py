import helpers as help
from collections import deque
import TreeRecorder

def bfs(start_node, goal_node):
    record = TreeRecorder.TreeRecorder()
    frontier =  deque()
    frontier.append((start_node, record.add(start_node, parent = None)))
    parent_map = {start_node: None}
    
    visited = set([start_node])
    
    while frontier:
        state, node_id = frontier.popleft()
        
        if state == goal_node:
            return record.path_to_root(node_id), record.export_tree(node_id)
        
        children = help.generate_children(state)
        
        for child, move in children:
                if  child not in visited: # I used only this instead of the condition  (child not in frontier and child not in visited) , 
                    #because it takes O(N) , so the node is marked as visited once its parent expandes 
                    visited.add(child)
                    parent_map[child] = state
                    frontier.append((child, record.add(child, parent=node_id, move=move))) 

    return None, []

if __name__ == "__main__":
    start_node = (1,4,2,6,5,8,7,3,0) 
    goal_node = (0,1,2,3,4,5,6,7,8)
    
    path = bfs(start_node, goal_node)
    
    for state in path:
        state_2d = [state[i:i+3] for i in range(0, len(state), 3)]
        for row in state_2d:
            print(row)
        print("\n")
        