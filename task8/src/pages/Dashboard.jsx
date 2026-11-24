import { Link, useSearchParams } from "react-router";
import { useDashboard } from "../hooks/useDashboard.js";
import { REGIONS, STATUS_LABELS } from "../constants.js";
import StatusMessage from "../components/StatusMessage.jsx";
import DifficultyStars from "../components/DifficultyStars.jsx";

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
  // The region filter is stored in the URL (?region=...), so it survives refresh
  const [searchParams, setSearchParams] = useSearchParams();
  const regionParam = searchParams.get("region");
  const region = REGIONS.includes(regionParam) ? regionParam : "all";

  // Statistics come from a memoized selector (selectDashboardStats):
  // they are calculated again only when the quests or the region change
  const { status, stats, error, retry } = useDashboard(region);

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

  if (status === "failed") {
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
