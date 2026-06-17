import { getUserSessions } from './sessionService';

export const getLastProgression = async (userId: string) => {
  const sessions = await getUserSessions(userId);

  const exerciseMap = new Map<string, number[]>();

  sessions.forEach((session) => {
    session.series.forEach((serie) => {
      const maxWeight = Math.max(
        ...serie.sets.map((s) => s.weight || 0)
      );

      if (!exerciseMap.has(serie.exerciseName)) {
        exerciseMap.set(serie.exerciseName, []);
      }

      exerciseMap.get(serie.exerciseName)?.push(maxWeight);
    });
  });

  for (const [exerciseName, weights] of exerciseMap.entries()) {
    if (weights.length >= 2) {
      const previous = weights[weights.length - 2];
      const current = weights[weights.length - 1];

      if (previous > 0 && current > previous) {
        return {
          exerciseName,
          previous,
          current,
          difference: current - previous,
          evolution: Number(
            (((current - previous) / previous) * 100).toFixed(2)
          ),
        };
      }
    }
  }

  return null;
};

export const getPersonalRecord = async (userId: string) => {
  const sessions = await getUserSessions(userId);

  let bestRecord = {
    exerciseName: '',
    weight: 0,
  };

  sessions.forEach((session) => {
    session.series.forEach((serie) => {
      const maxWeight = Math.max(
        ...serie.sets.map((s) => s.weight || 0)
      );

      if (maxWeight > bestRecord.weight) {
        bestRecord = {
          exerciseName: serie.exerciseName,
          weight: maxWeight,
        };
      }
    });
  });

  return bestRecord.weight > 0 ? bestRecord : null;
};