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
    }
  ]
};