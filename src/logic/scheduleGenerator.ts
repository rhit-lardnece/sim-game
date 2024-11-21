import { Team } from '@/types/team';
import { YearlyLeagueSchedule, TeamSchedule, Meet, Race } from '@/types/schedule';
import { raceTypes } from '@/constants/raceTypes';
import { seasonPhases } from '@/constants/seasonPhases';
import {mapWeekToSeason} from '@/logic/meetGenerator';

let meetIdCounter = 1;

// Generate League Schedule
export function generateYearlyLeagueSchedule(teams: Team[], year: number): YearlyLeagueSchedule {
    const leagueSchedule: YearlyLeagueSchedule = {
        year,
        meets: []
    };
    let regularSeasonPhase = seasonPhases.regularCrossCountry;
    for (let week = regularSeasonPhase.startWeek; week <= regularSeasonPhase.endWeek; week++) {
        const meetsForWeek = createMeetsForWeek(teams, week, year);
        leagueSchedule.meets.push(...meetsForWeek);
    }
    let trackField1RegularSeasonPhase = seasonPhases.regularTrackField1;
    for (let week = trackField1RegularSeasonPhase.startWeek; week <= trackField1RegularSeasonPhase.endWeek; week++) {
        const meetsForWeek = createMeetsForWeek(teams, week, year);
        leagueSchedule.meets.push(...meetsForWeek);
    }

    let trackField2RegularSeasonPhase = seasonPhases.regularTrackField2;
    for (let week = trackField2RegularSeasonPhase.startWeek; week <= trackField2RegularSeasonPhase.endWeek; week++) {
        const meetsForWeek = createMeetsForWeek(teams, week, year);
        leagueSchedule.meets.push(...meetsForWeek);
    }

    return leagueSchedule;
}

// Generate Meets for a Given Week
function createMeetsForWeek(teams: Team[],  week: number, year: number): Meet[] {
    const teamPairs = pairTeams(teams);
    return teamPairs.map(pair => createMeet(pair, week, year));
}

// Pair Teams for Meets
function pairTeams(teams: Team[]): Team[][] {
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const pairs: Team[][] = [];
    for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
        pairs.push([shuffledTeams[i], shuffledTeams[i + 1]]);
    }
    return pairs;
}

// Create a Meet for a Pair of Teams
function createMeet(teams: Team[], week: number, year: number): Meet {
    return {
        week,
        meetId: meetIdCounter++,
        date: `Week ${week}`,
        year,
        teams,
        races: createRacesForMeet(mapWeekToSeason(week)),
        meetType: mapWeekToSeason(week),
    };
}

// Create Races Based on Season Type
function createRacesForMeet(seasonType: 'cross_country' | 'track_field'): Race[] {
    const eventTypes = raceTypes[seasonType];
    return eventTypes.map(eventType => ({
        eventType,
        heats: [],
        participants: []
    }));
}

// Generate Individual Team Schedules from League Schedule
export function generateTeamSchedules(leagueSchedule: YearlyLeagueSchedule, teams: Team[], year: number): TeamSchedule[] {
    return teams.map(team => ({
        teamId: team.teamId,
        year,
        meets: leagueSchedule.meets.filter(meet => meet.teams.some(t => t.teamId === team.teamId)),
    }));
}