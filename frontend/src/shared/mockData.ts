import type { Schedule, Topic } from "./types"

export const mockSchedule: Schedule = {
  id: "schedule-1",
  startDate: "2026-01-10",
  endDate: "2026-01-20",
  createdAt: "2026-01-09",
  days: [
    {
      date: "2026-01-10",
      topics: [
        {
          id: "topic-1",
          title: "Arrays Basics",
          difficulty: "easy",
          notes: "Focus on indexing, traversal, and edge cases.",
          description: "Introduction to arrays and basic operations.",
          completed: true,
          resource: [
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
      date: "2026-01-11",
      topics: [
        {
          id: "topic-2",
          title: "Binary Search",
          difficulty: "medium",
          notes: "",
          description: "Efficient searching technique on sorted arrays.",
          completed: false,
          resource: [
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
      date: "2026-01-12",
      topics: [
        {
          id: "topic-3",
          title: "Two Pointer Technique",
          difficulty: "medium",
          notes: "Use for sorted arrays and string problems.",
          description: "Optimized approach using two indices.",
          completed: false,
          resource: [
            {
              id: "res-5",
              type: "article",
              title: "Two Pointer Technique",
              url: "https://www.geeksforgeeks.org/two-pointers-technique/"
            }
          ]
        }
      ]
    },
    {
      date: "2026-01-13",
      topics: [
        {
          id: "topic-4",
          title: "Sliding Window",
          difficulty: "hard",
          notes: "",
          description: "Window-based optimization for subarray problems.",
          completed: false,
          resource: [
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
};

export const mockTopic:Topic[] = [
  {
    id: "topic-1",
    title: "Arrays Basics",
    difficulty: "easy",
    notes: "Focus on indexing, traversal, and edge cases.",
    description: "Introduction to arrays and basic operations.",
    completed: true,
    resource: [
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
  },
  {
    id: "topic-2",
    title: "Binary Search",
    difficulty: "medium",
    notes: "",
    description: "Efficient searching technique on sorted arrays.",
    completed: false,
    resource: [
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
  },
  {
    id: "topic-3",
    title: "Two Pointer Technique",
    difficulty: "medium",
    notes: "Use for sorted arrays and string problems.",
    description: "Optimized approach using two indices.",
    completed: false,
    resource: [
      {
        id: "res-5",
        type: "article",
        title: "Two Pointer Technique",
        url: "https://www.geeksforgeeks.org/two-pointers-technique/"
      }
    ]
  },
  {
    id: "topic-4",
    title: "Sliding Window",
    difficulty: "hard",
    notes: "",
    description: "Window-based optimization for subarray problems.",
    completed: true,
    resource: [
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
];