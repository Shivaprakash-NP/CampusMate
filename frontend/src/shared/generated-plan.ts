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