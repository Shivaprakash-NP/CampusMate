export interface StudyTopic {
  subject: string;
  topic: string;
  subtopics?: string[];
  estimated_hours: number;
}

export interface DailyPlan {
  day: number;
  date: string;
  focus: string;
  topics: StudyTopic[];
  tasks: string[];
}

export interface ExamStudyPlan {
  exam_date: string;
  total_days: number;
  daily_study_hours: number;
  strategy: string;
  plan: DailyPlan[];
}

export const CAMPUSMATE_PLAN: ExamStudyPlan = {
  exam_date: "2026-03-25",
  total_days: 20,
  daily_study_hours: 3,
  strategy: "Concept First → Practice → Revision → Mock",
  plan: [
    {
      day: 1,
      date: "2026-03-05",
      focus: "Core Fundamentals",
      topics: [
        {
          subject: "Operating Systems",
          topic: "Process Management",
          subtopics: ["Process states", "PCB", "Context switching"],
          estimated_hours: 1.5
        },
        {
          subject: "DBMS",
          topic: "Normalization",
          subtopics: ["1NF", "2NF", "3NF", "BCNF"],
          estimated_hours: 1.5
        }
      ],
      tasks: [
        "Review university lecture notes",
        "Solve 10 previous year questions on Normalization",
        "Draw process state transition diagram"
      ]
    },
    {
      day: 2,
      date: "2026-03-06",
      focus: "Modern Web Frameworks",
      topics: [
        {
          subject: "Web Development",
          topic: "TypeScript & ReactJS",
          subtopics: ["Generics", "Hooks", "Props Mapping"],
          estimated_hours: 2
        },
        {
          subject: "Operating Systems",
          topic: "Scheduling Algorithms",
          estimated_hours: 1
        }
      ],
      tasks: [
        "Implement a custom hook in CampusMate project",
        "Solve FCFS and Round Robin numericals",
        "Revise Day 1 short notes"
      ]
    },
    {
      day: 3,
      date: "2026-03-07",
      focus: "Backend Architecture",
      topics: [
        {
          subject: "Spring Boot",
          topic: "Microservices",
          subtopics: ["Rest Controllers", "Service Layer", "JPA"],
          estimated_hours: 3
        }
      ],
      tasks: [
        "Set up a CRUD repository for the Student entity",
        "Test endpoints using Postman",
        "Complete the weekly progress quiz"
      ]
    },
        {
      day: 4,
      date: "2026-03-08",
      focus: "Operating Systems - Memory",
      topics: [
        {
          subject: "Operating Systems",
          topic: "Memory Management",
          subtopics: ["Paging", "Segmentation", "Virtual Memory"],
          estimated_hours: 2
        },
        {
          subject: "DBMS",
          topic: "Indexing",
          subtopics: ["B+ Trees", "Clustered Index", "Non-Clustered Index"],
          estimated_hours: 1
        }
      ],
      tasks: [
        "Solve paging numericals",
        "Draw B+ Tree example",
        "Revise scheduling algorithms"
      ]
    },
    {
      day: 5,
      date: "2026-03-09",
      focus: "DBMS Transactions",
      topics: [
        {
          subject: "DBMS",
          topic: "Transactions & Concurrency",
          subtopics: ["ACID properties", "Serializability", "Locking protocols"],
          estimated_hours: 2
        },
        {
          subject: "Web Development",
          topic: "State Management",
          subtopics: ["Context API", "Redux basics"],
          estimated_hours: 1
        }
      ],
      tasks: [
        "Solve transaction schedule problems",
        "Implement global state in CampusMate",
        "Revise normalization"
      ]
    },
    {
      day: 6,
      date: "2026-03-10",
      focus: "Computer Networks Basics",
      topics: [
        {
          subject: "Computer Networks",
          topic: "OSI & TCP/IP Models",
          subtopics: ["Layers", "Protocols", "Encapsulation"],
          estimated_hours: 2
        },
        {
          subject: "Operating Systems",
          topic: "Deadlocks",
          subtopics: ["Conditions", "Prevention", "Banker's Algorithm"],
          estimated_hours: 1
        }
      ],
      tasks: [
        "Draw OSI model diagram",
        "Solve Banker's Algorithm example",
        "Prepare short notes"
      ]
    },
    {
      day: 7,
      date: "2026-03-11",
      focus: "Spring Boot Deep Dive",
      topics: [
        {
          subject: "Spring Boot",
          topic: "Security & JWT",
          subtopics: ["Authentication", "Authorization", "Token Flow"],
          estimated_hours: 2
        },
        {
          subject: "DBMS",
          topic: "SQL Practice",
          subtopics: ["Joins", "Subqueries", "Group By"],
          estimated_hours: 1
        }
      ],
      tasks: [
        "Implement JWT authentication",
        "Write 15 SQL queries",
        "Revise ACID properties"
      ]
    },
    {
      day: 8,
      date: "2026-03-12",
      focus: "Data Structures Practice",
      topics: [
        {
          subject: "DSA",
          topic: "Stacks & Queues",
          subtopics: ["Applications", "Implementation", "Infix to Postfix"],
          estimated_hours: 2
        },
        {
          subject: "Operating Systems",
          topic: "File Systems",
          subtopics: ["Inodes", "Directory Structure"],
          estimated_hours: 1
        }
      ],
      tasks: [
        "Solve 5 stack problems",
        "Implement queue using array",
        "Revise memory management"
      ]
    },
    {
      day: 9,
      date: "2026-03-13",
      focus: "Revision Block 1",
      topics: [
        {
          subject: "Operating Systems",
          topic: "Full Revision",
          estimated_hours: 2
        },
        {
          subject: "DBMS",
          topic: "Full Revision",
          estimated_hours: 1
        }
      ],
      tasks: [
        "Revise short notes",
        "Solve mixed PYQs",
        "Identify weak areas"
      ]
    },
    {
      day: 10,
      date: "2026-03-14",
      focus: "Mock Test 1",
      topics: [
        {
          subject: "Mixed Subjects",
          topic: "Full-Length Mock Test",
          estimated_hours: 3
        }
      ],
      tasks: [
        "Take mock test under exam conditions",
        "Analyze mistakes",
        "Update revision sheet"
      ]
    },
    {
      day: 11,
      date: "2026-03-15",
      focus: "Computer Networks Advanced",
      topics: [
        {
          subject: "Computer Networks",
          topic: "Transport Layer",
          subtopics: ["TCP", "UDP", "Congestion Control"],
          estimated_hours: 2
        },
        {
          subject: "Spring Boot",
          topic: "Dockerization",
          subtopics: ["Dockerfile", "Docker Compose"],
          estimated_hours: 1
        }
      ],
      tasks: [
        "Explain TCP handshake",
        "Dockerize backend project",
        "Revise mock mistakes"
      ]
    },
    {
      day: 12,
      date: "2026-03-16",
      focus: "System Design Basics",
      topics: [
        {
          subject: "System Design",
          topic: "Scalability Concepts",
          subtopics: ["Load Balancing", "Caching", "Microservices"],
          estimated_hours: 2
        },
        {
          subject: "DBMS",
          topic: "NoSQL Basics",
          estimated_hours: 1
        }
      ],
      tasks: [
        "Design URL shortener conceptually",
        "Compare SQL vs NoSQL",
        "Revise Docker concepts"
      ]
    },
    {
      day: 13,
      date: "2026-03-17",
      focus: "Revision Block 2",
      topics: [
        {
          subject: "Computer Networks",
          topic: "Full Revision",
          estimated_hours: 1.5
        },
        {
          subject: "Spring Boot",
          topic: "Full Revision",
          estimated_hours: 1.5
        }
      ],
      tasks: [
        "Revise short notes",
        "Solve important numericals",
        "Prepare formula sheet"
      ]
    },
    {
      day: 14,
      date: "2026-03-18",
      focus: "Mock Test 2",
      topics: [
        {
          subject: "Mixed Subjects",
          topic: "Full-Length Mock Test",
          estimated_hours: 3
        }
      ],
      tasks: [
        "Take mock test",
        "Analyze weak sections",
        "Revise targeted topics"
      ]
    },
    {
      day: 15,
      date: "2026-03-19",
      focus: "Final Revision",
      topics: [
        {
          subject: "All Subjects",
          topic: "High-Weightage Topics",
          estimated_hours: 3
        }
      ],
      tasks: [
        "Revise formulas and diagrams",
        "Quick review of mistakes",
        "Prepare exam-day checklist"
      ]
    }
  ]
};