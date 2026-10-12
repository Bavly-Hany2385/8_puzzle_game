import helpers as help

def dfs(start_node, goal_node):
    stack = [start_node]
    visited = set()
    parent_map = {start_node: None}

    while stack:
        current_node = stack.pop()

        if current_node == goal_node:
            return help.get_path(current_node, parent_map)

        if current_node not in visited:
            visited.add(current_node)
            children = help.generate_children(current_node)

            for child in children:
                if child not in visited:
                    stack.append(child)
                    parent_map[child] = current_node

    return None