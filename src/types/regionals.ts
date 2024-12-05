// export interface Region {
//     regionId: number;
//     regionName: string;
//     conferenceIds: number[];
// } implement later when needed -- need to clean data

export interface Conference {
    conferenceId: number;
    conferenceName: string;
    teamIds: number[];
}

export interface School {
    collegeId: number;
    collegeName: string;
    conferenceId: number;
    state: string;
    nickname: string;
    city: string;
    // regionId: number;
}