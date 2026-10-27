class TreeRecorder:
    def __init__(self):
        self.nodes = []
        self.depths = []
        self.expanded = 0    
        self.max_depth = 0 

    def add(self, state, parent, move=None):
        depth = 0 if parent is None else self.depths[parent] + 1
        self.depths.append(depth)
        self.max_depth = max(self.max_depth, depth)
        self.nodes.append({
            "id": len(self.nodes),
            "state": list(state),
            "parent": parent,
            "move": move
        })
        return len(self.nodes) - 1  #Return the id of the new node

    def stats(self, goal_id):
        return {
            "cost": self.depths[goal_id],
            "nodes_expanded": self.expanded,
            "search_depth": self.max_depth,
        }

    
    def path_to_root(self, node_id):
        path = []
        while node_id is not None:
            path.append(self.nodes[node_id]["state"])
            node_id = self.nodes[node_id]["parent"]
        return path[::-1]  # Return the path from root to the given node   
     
    def export_tree(self, goal_id, limit = 400):
        keep = {node["id"] for node in self.nodes[:limit]}
        current_node_id = goal_id
        while current_node_id is not None:
            keep.add(current_node_id)
            current_node_id = self.nodes[current_node_id]["parent"]
        return [node for node in self.nodes if node["id"] in keep]