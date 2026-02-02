export type TagDistributionItem = {
  name: string;
  count: number;
};

type WorkoutWithTags = {
  tags?: Array<{
    name: string;
  }>;
};

export function getTagDistribution(workouts: WorkoutWithTags[]): TagDistributionItem[] {
  const counts = new Map<string, number>();

  workouts.forEach((workout) => {
    workout.tags?.forEach((tag) => {
      const key = tag.name.trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTagDistributionForTags(
  workouts: WorkoutWithTags[],
  allowedTags: string[]
): TagDistributionItem[] {
  const normalized = new Set(allowedTags.map((tag) => tag.trim().toLowerCase()));
  return getTagDistribution(workouts).filter((item) => normalized.has(item.name));
}
