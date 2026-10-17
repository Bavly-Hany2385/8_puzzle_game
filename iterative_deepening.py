import helpers as help

def _depth_limited_search(current_node, goal_node, depth_limit, visited, parent_map):
    if current_node == goal_node:
        return help.get_path(current_node, parent_map)

    if depth_limit <= 0:
        return None

    visited.add(current_node)
    children = help.generate_children(current_node)

    for child in children:
        if child not in visited:
            parent_map[child] = current_node
            result = _depth_limited_search(child, goal_node, depth_limit - 1, visited, parent_map)
            if result is not None:
                return result
            parent_map.pop(child, None)  # Remove child from parent_map if not found
    
    visited.remove(current_node)  # Remove current_node from visited to allow other paths

    return None

def iterative_deepening(current_node, goal_node, max_depth=100):
    for depth_limit in range(max_depth + 1):
        visited = set()
        parent_map = {current_node: None}
        result = _depth_limited_search(current_node, goal_node, depth_limit, visited, parent_map)
        if result is not None:
            return result

    return None