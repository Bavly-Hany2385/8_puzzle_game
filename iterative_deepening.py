import helpers as help
import TreeRecorder

def _depth_limited_search(current_node, current_id, goal_node, depth_limit, visited, record):
    if current_node == goal_node:
        return record.path_to_root(current_id), record.export_tree(current_id)

    if depth_limit <= 0:
        return None

    visited.add(current_node)
    children = help.generate_children(current_node)

    for child, move in children: 
        if child not in visited:
            child_id = record.add(child, parent=current_id, move=move)
            
            result = _depth_limited_search(child, child_id, goal_node, depth_limit - 1, visited, record)
            if result is not None:
                return result
    
    visited.remove(current_node)  # Remove current_node from visited to allow other paths

    return None

def iterative_deepening(current_node, goal_node, max_depth=100):
    for depth_limit in range(max_depth + 1):
        visited = set()
        record = TreeRecorder.TreeRecorder()
        start_id = record.add(current_node, parent=None) 
        
        result = _depth_limited_search(current_node, start_id, goal_node, depth_limit, visited, record)
        if result is not None:
            return result

    return None, []