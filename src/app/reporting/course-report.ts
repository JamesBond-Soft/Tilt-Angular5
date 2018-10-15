export interface ICompletedCourseSummary {
    courseSessionId: number;
    staffName: string;
    courseName: string;
    dateCompleted: Date;
    finalScore: number;
    totalQuestions: number;
    isPassed: boolean; 
}

export interface INoncomplianceCourseSummary {
    staffName: string;
    courseName: string;
    progress: number;
    userId: number;
    source : string;
    dueDate : Date;
}
