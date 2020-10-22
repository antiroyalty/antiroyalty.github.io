---
layout: post
title:  "Trees"
date:   2020-10-22 13:18:39 -0700
---

## Sorted array to binary search tree

```ruby
# Definition for a binary tree node.
# class TreeNode
#     attr_accessor :val, :left, :right
#     def initialize(val = 0, left = nil, right = nil)
#         @val = val
#         @left = left
#         @right = right
#     end
# end
# @param {Integer[]} nums
# @return {TreeNode}
def sorted_array_to_bst(nums)
    root = TreeNode.new(nums[(nums.length - 1)/ 2])
    sorted_array_to_bst_helper(nums)
end

def sorted_array_to_bst_helper(array)
    return nil if array.length == 0
    
    midpoint = array[(array.length - 1)/2]
    node = TreeNode.new(midpoint)
    
    node.left = sorted_array_to_bst_helper(array[0...(array.length-1)/2])
    node.right = sorted_array_to_bst_helper(array[(array.length+1)/2..-1])
    
    return node
end
```

## First bad version
```ruby
# The is_bad_version API is already defined for you.
# @param {Integer} version
# @return {boolean} whether the version is bad
# def is_bad_version(version):

# @param {Integer} n
# @return {Integer}
def first_bad_version(n)
    return n if n == 1
    first_bad_version_helper(1, n)
end
    
def first_bad_version_helper(min, max)
    return min if min == max
    
    mid = min + (max - min)/2

    if is_bad_version(mid)
        first_bad_version_helper(min, mid)
    else
        first_bad_version_helper(mid + 1, max) # search upper half
    end
end
```

## Merge sorted array
```ruby
# @param {Integer[]} nums1
# @param {Integer} m
# @param {Integer[]} nums2
# @param {Integer} n
# @return {Void} Do not return anything, modify nums1 in-place instead.
def merge(nums1, m, nums2, n)
    return if n == 0
    i = 0
    j = 0
    
    if m == 0
        nums1.each_with_index do |n, l|
            nums1[l] = nums2[l]
        end
        return
    end

    (0).upto(m+n) do |k|
        return if i == m && j == n

        num1_val = i == m ? nil : nums1[nums1.length - (nums1.length - m) - i - 1]
        num2_val = j == n ? nil : nums2[nums2.length - 1 - j]
        write_at = nums1.length - 1 - k
        
        if i == m
            nums1[write_at] = num2_val
            j += 1
        elsif j == n
            nums1[write_at] = num1_val
            i += 1
        elsif num1_val >= num2_val
            nums1[write_at] = num1_val
            i += 1
        else
            nums1[write_at] = num2_val
            j += 1
        end
    end
end
```

## Symmetric tree
```ruby
# Definition for a binary tree node.
# class TreeNode
#     attr_accessor :val, :left, :right
#     def initialize(val = 0, left = nil, right = nil)
#         @val = val
#         @left = left
#         @right = right
#     end
# end
# @param {TreeNode} root
# @return {Boolean}
def is_mirror(left, right)
    return true if (left.nil? && right.nil?)
    return false if (left.nil? || right.nil?)
    return false if left.val != right.val
    return false if !is_mirror(left.left, right.right)
    return false if !is_mirror(left.right, right.left)
    return true
end

def is_symmetric(root)
    return true if root.nil?
    is_mirror(root.left, root.right)
end
```

## Binary Tree Level Order Traversal
```ruby
# Definition for a binary tree node.
# class TreeNode
#     attr_accessor :val, :left, :right
#     def initialize(val = 0, left = nil, right = nil)
#         @val = val
#         @left = left
#         @right = right
#     end
# end
# @param {TreeNode} root
# @return {Integer[][]}

def level_order(root)
    level_order_helper(root, [], 0)
end

def level_order_helper(node, levels, i)
    return levels if node.nil?
    
    if levels[i].nil?
        levels[i] = []
    end
    
    levels[i].append(node.val)
    
    level_order_helper(node.left, levels, i+1) # go left
    level_order_helper(node.right, levels, i+1) # go right
end
```

## Binary Tree Zigzag Level Order Traversal
```ruby
# Definition for a binary tree node.
# class TreeNode
#     attr_accessor :val, :left, :right
#     def initialize(val = 0, left = nil, right = nil)
#         @val = val
#         @left = left
#         @right = right
#     end
# end
# @param {TreeNode} root
# @return {Integer[][]}

def zigzag_level_order(root)
    result = zigzag_level_order_helper(root, [], 0)
    i = 0
    
    result.map! do |row|
        row = row.reverse! if i % 2 != 0
        i += 1
        row
    end
end

def zigzag_level_order_helper(node, levels, i)
    return levels if node.nil?
    
    if levels[i].nil?
        levels[i] = []
    end
    
    levels[i].append(node.val)
    
    zigzag_level_order_helper(node.left, levels, i+1)
    zigzag_level_order_helper(node.right, levels, i+1)
end
```

## Validate Binary Search Tree
```ruby
# Definition for a binary tree node.
# class TreeNode
#     attr_accessor :val, :left, :right
#     def initialize(val = 0, left = nil, right = nil)
#         @val = val
#         @left = left
#         @right = right
#     end
# end
# @param {TreeNode} root
# @return {Boolean}
def is_valid_bst(root)
    return true if root.nil?
    node = root
    
    preorder_is_valid_bst_helper(node, nil, nil)
end

def preorder_is_valid_bst_helper(node, min, max)
    return true if node.nil?

    # puts "val #{node.val} --- min #{min}; max #{max}; left #{node.left.inspect}; right #{node.right.inspect}" # read data

    if (!min.nil? && node.val <= min) || (!max.nil? && node.val >= max)
        return false
    end
    
    left_valid = preorder_is_valid_bst_helper(node.left, min, node.val) # read left
    right_valid = preorder_is_valid_bst_helper(node.right, node.val, max) # read right
    
    left_valid && right_valid
end
```