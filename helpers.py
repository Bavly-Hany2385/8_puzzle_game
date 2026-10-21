def get_neighbours(node, tree):
    neighbours = []
    if node in tree:
        neighbours.extend(tree[node])
    return neighbours

def get_path(node, parent_map):
    path = []
    while node is not None:
        path.append(node)
        node = parent_map.get(node)
    return path[::-1]

def generate_children(node):
    children = []
    starting_index = node.index(0)
    row, col = divmod(starting_index, 3)    #if 0 at index 5 (0 based) then its at row 1, col 2
    moves = [(-1, 0, "up"), (1, 0, "down"), (0, -1, "left"), (0, 1, "right")]  #Up, Down, Left, Right
    for move in moves:
        new_row, new_col, name = row + move[0], col + move[1], move[2]
        if 0 <= new_row < 3 and 0 <= new_col < 3:
            new_index = new_row * 3 + new_col
            new_node = list(node)
            new_node[starting_index], new_node[new_index] = new_node[new_index], new_node[starting_index]
            children.append((tuple(new_node), name))
    return children