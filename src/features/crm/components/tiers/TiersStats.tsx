interface TiersStatsProps {
  counts: {
    tous: number;
    clients: number;
    fournisseurs: number;
    "sous_traitants": number;
    prospects: number;
  };
}

export function TiersStats({ counts }: TiersStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
          {counts.tous}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Total tiers
        </div>
      </div>
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-blue-600">{counts.clients}</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Clients
        </div>
      </div>
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-amber-600">{counts.fournisseurs}</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Fournisseurs
        </div>
      </div>
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-indigo-600">{counts.prospects}</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Prospects
        </div>
      </div>
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-purple-600">{counts["sous_traitants"]}</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Sous-traitants
        </div>
      </div>
    </div>
  );
} 