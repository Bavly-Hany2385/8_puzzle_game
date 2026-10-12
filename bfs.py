import helpers as help
from collections import deque

def bfs(start_node, goal_node):
    frontier =  deque([start_node]) 
    
    parent_map = {start_node: None}
    
    visited = set([start_node])
    
    while frontier:
        state = frontier.popleft()
        
        if state == goal_node:
            return help.get_path(state, parent_map)
        
        children = help.generate_children(state)
        
        for child in children:
                if  child not in visited: # I used only this instead of the condition  (child not in frontier and child not in visited) , 
                    #because it takes O(N) , so the node is marked as visited once its parent expandes 
                    visited.add(child)
                    parent_map[child] = state
                    frontier.append(child) 

    return None

if __name__ == "__main__":
    start_node = (1,4,2,6,5,8,7,3,0) 
    goal_node = (0,1,2,3,4,5,6,7,8)
    
    path = bfs(start_node, goal_node)
    
    for state in path:
        state_2d = [state[i:i+3] for i in range(0, len(state), 3)]
        for row in state_2d:
            print(row)
        print("\n")
        