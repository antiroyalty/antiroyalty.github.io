---
layout: post
title:  "DP"
date:   2020-10-22 13:18:39 -0700
---

# Dynamic Programming
### Climb Stairs

```
# @param {Integer} n
# @return {Integer}
def climb_stairs(n)
    climb_stairs_helper(n, {})
end

def climb_stairs_helper(n, solved)
    return 1 if n == 1 # 1 way to climb one stair
    return 2 if n == 2 # 2 ways to climb two stairs
    
    if solved.include?(n.to_s)
        return solved[n.to_s]
    else
        result_1 = climb_stairs_helper(n - 1, solved)
        result_2 = climb_stairs_helper(n - 2, solved)
        
        result = result_1 + result_2
        solved[n.to_s] = result
        
        return result
    end
end
```