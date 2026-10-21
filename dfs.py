import helpers as help
import TreeRecorder

def dfs(start_node, goal_node):
    record = TreeRecorder.TreeRecorder()
    stack = [(start_node, record.add(start_node, parent=None))]
    visited = set()
    parent_map = {start_node: None}

    while stack:
        current_node, node_id = stack.pop()

        if current_node == goal_node:
            return record.path_to_root(node_id), record.export_tree(node_id)

        if current_node not in visited:
            visited.add(current_node)
            children = help.generate_children(current_node)

            for child, move in reversed(children):
                if child not in visited:
                    stack.append((child, record.add(child, parent=node_id, move=move)))
                    parent_map[child] = current_node

    return None, []