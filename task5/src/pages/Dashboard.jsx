import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { getAllQuests } from "../services/service.js";
import { useFetch } from "../hooks/useFetch.js";
import { REGIONS, STATUS_LABELS } from "../constants.js";
import StatusMessage from "../components/StatusMessage.jsx";
import DifficultyStars from "../components/DifficultyStars.jsx";

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function countBy(quests, getKey, keys) {
  return keys.map((key) => ({
    key,
    count: quests.filter((q) => getKey(q) === key).length,
  }));
}

function calculateStats(quests) {
  const completed = quests.filter((q) => q.status === "completed").length;

  return {
    total: quests.length,
    open: quests.filter((q) => q.status === "open").length,
    completionRate: quests.length ? Math.round((completed / quests.length) * 100) : 0,
    totalReward: quests.reduce((sum, q) => sum + q.reward, 0),
    avgReward: Math.round(average(quests.map((q) => q.reward))),
    avgDifficulty: average(quests.map((q) => q.difficulty)).toFixed(1),
    byStatus: countBy(quests, (q) => q.status, Object.keys(STATUS_LABELS)),
    byDifficulty: countBy(quests, (q) => q.difficulty, [1, 2, 3, 4, 5]),
    byRegion: countBy(quests, (q) => q.region, REGIONS).sort((a, b) => b.count - a.count),
    topRewards: [...quests].sort((a, b) => b.reward - a.reward).slice(0, 5),
  };
}

function Breakdown({ title, rows, max, renderLabel, linkFor }) {
  return (
    <div className="box dash-panel">
      <h3>{title}</h3>
      <ul className="bars">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="bar-label">
              <Link to={linkFor(row.key)}>{renderLabel(row.key)}</Link>
              <span>{row.count}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${max ? (row.count / max) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const { status, data: quests, error, retry } = useFetch(getAllQuests);

  // The region filter is stored in the URL (?region=...), so it survives refresh
  const [searchParams, setSearchParams] = useSearchParams();
  const regionParam = searchParams.get("region");
  const region = REGIONS.includes(regionParam) ? regionParam : "all";

  // Statistics are recalculated only when the data or the filter changes
  const stats = useMemo(() => {
    if (!quests) return null;
    return calculateStats(region === "all" ? quests : quests.filter((q) => q.region === region));
  }, [quests, region]);

  function handleRegionChange(e) {
    const value = e.target.value;
    setSearchParams(value === "all" ? {} : { region: value });
  }

  // Links open the quest list with the same region + the clicked value
  function questsLink(name, value) {
    const params = new URLSearchParams();
    if (region !== "all") params.set("region", region);
    params.set(name, value);
    return `/quests?${params}`;
  }

  if (status === "loading") {
    return <StatusMessage variant="loading" title="Counting the guild's quests..." />;
  }

  if (status === "error") {
    return (
      <StatusMessage
        variant="error"
        title="Could not load the dashboard"
        text={error.message}
        actionLabel="Try again"
        onAction={retry}
      />
    );
  }

  const cards = [
    { label: "Quests", value: stats.total },
    { label: "Open quests", value: stats.open },
    { label: "Completion rate", value: `${stats.completionRate}%` },
    { label: "Total reward", value: `${stats.totalReward.toLocaleString("en-US")}g` },
    { label: "Average reward", value: `${stats.avgReward}g` },
    { label: "Average difficulty", value: `${stats.avgDifficulty} / 5` },
  ];

  const maxStatus = Math.max(...stats.byStatus.map((r) => r.count));
  const maxDifficulty = Math.max(...stats.byDifficulty.map((r) => r.count));
  const maxRegion = Math.max(...stats.byRegion.map((r) => r.count));

  return (
    <section>
      <div className="toolbar">
        <h2>Guild dashboard</h2>
        <label className="field dash-filter">
          Region
          <select value={region} onChange={handleRegionChange}>
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {stats.total === 0 ? (
        <StatusMessage variant="empty" title="No quests in this region yet" />
      ) : (
        <>
          <div className="stats">
            {cards.map((card) => (
              <div key={card.label} className="stat">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>

          <div className="dash-grid">
            <Breakdown
              title="By status"
              rows={stats.byStatus}
              max={maxStatus}
              renderLabel={(key) => STATUS_LABELS[key]}
              linkFor={(key) => questsLink("status", key)}
            />
            <Breakdown
              title="By difficulty"
              rows={stats.byDifficulty}
              max={maxDifficulty}
              renderLabel={(key) => <DifficultyStars level={key} />}
              linkFor={(key) => questsLink("difficulty", key)}
            />
            {region === "all" && (
              <Breakdown
                title="By region"
                rows={stats.byRegion}
                max={maxRegion}
                renderLabel={(key) => key}
                linkFor={(key) => questsLink("region", key)}
              />
            )}

            <div className="box dash-panel">
              <h3>Richest rewards</h3>
              <ol className="top-list">
                {stats.topRewards.map((q) => (
                  <li key={q.id}>
                    <Link to={`/quests/${q.id}`}>{q.title}</Link>
                    <span>{q.reward}g</span>
                  </li>
                ))}
              </ol>
              <Link to={questsLink("sort", "rewardDesc")} className="dash-more">
                All quests by reward →
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
