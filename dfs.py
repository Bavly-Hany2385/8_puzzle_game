import helpers as help

def dfs(current_node, goal_node, visited=None, parent_map=None):
    if visited is None:
        visited = set()
    if parent_map is None:
        parent_map = {current_node: None}

    if current_node == goal_node:
        return help.get_path(current_node, parent_map)

    visited.add(current_node)
    children = help.generate_children(current_node)

    for child in children:
        if child not in visited:
            parent_map[child] = current_node
            result = dfs(child, goal_node, visited, parent_map)
            if result is not None:
                return result

    return None