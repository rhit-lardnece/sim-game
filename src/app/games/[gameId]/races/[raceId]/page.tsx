"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGameData } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';

export default function RaceResultsPage() {
    const { gameId, raceId } = useParams();
    const [race, setRace] = useState<Race | null>(null);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: string }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: string }>({});
    const [meet, setMeet] = useState<Meet | null>();

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const selectedRace =
                gameData.leagueSchedule.meets
                    .flatMap(meet => meet.races)
                    .find(race => race.raceId === Number(raceId));

            setRace(selectedRace || null);

            if (selectedRace) {
                const selectedMeet = gameData.leagueSchedule.meets.find(meet => meet.races.some(r => r.raceId === selectedRace.raceId));
                setMeet(selectedMeet);
            }

            // Create a mapping of teamId to team college
            const teamsMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                accumlated[team.teamId] = team.college;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);

            // Create a mapping of playerId to player name
            const playersMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                team.players.forEach(player => {
                    accumlated[player.playerId] = player.firstName + ' ' + player.lastName;
                });
                return accumlated;
            }, {});
            setPlayersMap(playersMapping);
        }
        fetchData();
    }, [gameId, raceId]);

    if (!race) return <div>Loading...</div>;

    const sortedParticipants = Object.entries(race.heats[0]?.playerTimes || {}).sort(([, timeA], [, timeB]) => timeA - timeB) || [];

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Race Results</h1>
            <Link href={`/games/${gameId}/schedule/${meet?.meetId}`}>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Meet: <span className="font-semibold">{meet?.week} - {meet?.season}</span></p>
            </Link>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Event: <span className="font-semibold">{race.eventType}</span></p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Results</h2>
            <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Position</th>
                        <th className="py-2 px-4 border-b">Player</th>
                        <th className="py-2 px-4 border-b">Team</th>
                        <th className="py-2 px-4 border-b">Time</th>
                        <th className="py-2 px-4 border-b">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedParticipants.map(([playerId, time], index) => (
                        <tr key={playerId}>
                            <td className="py-2 px-4 border-b">{index + 1}</td>
                            <td className="py-2 px-4 border-b">
                                <Link href={`/games/${gameId}/players/${playerId}`}>
                                    {playersMap[Number(playerId)]}
                                </Link>
                            </td>
                            <td className="py-2 px-4 border-b">
                                <Link href={`/games/${gameId}/teams/${race.participants[Number(playerId)]}`}>
                                    {teamsMap[Number(race.participants[Number(playerId)])]}
                                </Link>
                            </td>
                            <td className="py-2 px-4 border-b">{time}</td>
                            <td className="py-2 px-4 border-b">{index < 3 ? 10 - index * 3 : 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}