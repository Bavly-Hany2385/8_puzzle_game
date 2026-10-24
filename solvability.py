def get_inversions(state):
    inv_count = 0
    empty_value = 0  
    
    # O(N^2) (Acutally merge sort can be used to reduce it to O(N log N) but not necessary for small puzzles)
    for i in range(len(state)):
        for j in range(i + 1, len(state)):
            if state[i] != empty_value and state[j] != empty_value:
                if state[i] > state[j]:
                    inv_count += 1
                    
    return inv_count

def is_solvable(start_state, goal_state):
    start_inv = get_inversions(start_state)
    goal_inv = get_inversions(goal_state)
    
    return (start_inv % 2) == (goal_inv % 2)
