export type Difficulty = "easy" | "medium" | "hard"

export type Resources = {
    id: string,
    type: "video" | "article" | "pdf",
    title: string,
    url: string
}

export type Topic = {
    id:string,
    title: string,
    difficulty: Difficulty,
    notes: string,
    description: string,
    completed: boolean,
    resource: Resources[]
}

export type ScheduleDay = {
    date: string,
    topics: Topic[],
}

export type Schedule = {
    id: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    days: ScheduleDay[]
}

export type Message = { 
  id: string; 
  role: "user" | "ai"; 
  content: string;
};

export type SyllabusContext = { 
  id: number; 
  title: string; 
};
