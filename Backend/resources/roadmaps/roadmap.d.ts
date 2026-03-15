export type RoadmapData = {
    title: string;
    description: string;
    tags: string;
    mainConcepts: {
        name: string;
        description: string;
        order: number;
        subjects: {
            name: string;
            description: string;
            order: number;
            topics: {
                name: string;
                description: string;
                order: number;
            }[];
        }[];
    }[];
};
export declare const roadmapCategories: string[];
export declare const roadmaps: RoadmapData[];
//# sourceMappingURL=roadmap.d.ts.map