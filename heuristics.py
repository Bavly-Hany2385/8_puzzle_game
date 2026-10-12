import math

def get_coordinates(index):
    x = index % 3
    y = index // 3
    return x, y

def manhattan_heuristic(state, goal_node):
    total_distance = 0
    for i in range(9):
        tile = state[i]
        if tile != 0: 
            current_x, current_y = get_coordinates(i)
            goal_index = goal_node.index(tile)
            goal_x, goal_y = get_coordinates(goal_index)
            
            distance = abs(current_x - goal_x) + abs(current_y - goal_y)
            total_distance = total_distance + distance
            
    return total_distance

def euclidean_heuristic(state, goal_node):
    total_distance = 0
    for i in range(9):
        tile = state[i]
        if tile != 0:  
            current_x, current_y = get_coordinates(i)
            goal_index = goal_node.index(tile)
            goal_x, goal_y = get_coordinates(goal_index)
            
            distance = math.sqrt((current_x - goal_x)**2 + (current_y - goal_y)**2)
            total_distance = total_distance + distance
    return total_distance
