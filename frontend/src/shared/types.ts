export type Difficulty = "easy" | "medium" | "hard"

export type Resources = {
    id: string,
    type: "video" | "article" | "pdf",
    title: "string",
    url: string
}

export type Topic = {
    id:string,
    title: string,
    difficulty: Difficulty,
    completed: boolean,
    resource: Resources[]
}

export type ScheduleDay = {
    date: string,
    topicIds: string[]
}

export type Schedule = {
    id: string,
    startDate: string,
    endDate: string,
    days: ScheduleDay[]
}