import type { TopicNode } from "../shared/TopicNode.ts"

export const mockTopicTree: TopicNode[] = [
  {
    id: "ds",
    title: "Data Structures & Algorithms",
    children: [
      {
        id: "arrays",
        title: "Arrays",
        children: [
          {
            id: "arrays-basics",
            title: "Arrays Basics",
            difficulty: "easy",
            completed: true,
            notes: "Focus on indexing, traversal, and edge cases.",
            description: "Introduction to arrays and basic operations.",
            resources: [
              {
                id: "res-1",
                type: "article",
                title: "Array Data Structure",
                url: "https://www.geeksforgeeks.org/array-data-structure/"
              },
              {
                id: "res-2",
                type: "video",
                title: "Arrays Explained",
                url: "https://www.youtube.com/watch?v=QJNwK2uJyGs"
              }
            ]
          }
        ]
      },
      {
        id: "searching",
        title: "Searching Algorithms",
        children: [
          {
            id: "binary-search",
            title: "Binary Search",
            difficulty: "medium",
            completed: false,
            notes: "",
            description: "Efficient searching technique on sorted arrays.",
            resources: [
              {
                id: "res-3",
                type: "article",
                title: "Binary Search Algorithm",
                url: "https://www.geeksforgeeks.org/binary-search/"
              },
              {
                id: "res-4",
                type: "video",
                title: "Binary Search Explained",
                url: "https://www.youtube.com/watch?v=KXJSjte_OAI"
              }
            ]
          }
        ]
      },
      {
        id: "patterns",
        title: "Problem Solving Patterns",
        children: [
          {
            id: "two-pointer",
            title: "Two Pointer Technique",
            difficulty: "medium",
            completed: false,
            notes: "Use for sorted arrays and string problems.",
            description: "Optimized approach using two indices.",
            resources: [
              {
                id: "res-5",
                type: "article",
                title: "Two Pointer Technique",
                url: "https://www.geeksforgeeks.org/two-pointers-technique/"
              }
            ]
          },
          {
            id: "sliding-window",
            title: "Sliding Window",
            difficulty: "hard",
            completed: true,
            notes: "",
            description: "Window-based optimization for subarray problems.",
            resources: [
              {
                id: "res-6",
                type: "article",
                title: "Sliding Window Technique",
                url: "https://leetcode.com/tag/sliding-window/"
              },
              {
                id: "res-7",
                type: "video",
                title: "Sliding Window Patterns",
                url: "https://www.youtube.com/watch?v=MK-NZ4hN7rs"
              }
            ]
          }
        ]
      }
    ]
  }
]
