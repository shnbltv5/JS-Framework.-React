import { REGIONS, STATUS_LABELS, SORT_OPTIONS } from "../constants.js";

export default function FilterBar({ filters, onChange, onReset }) {
  function handleChange(e) {
    onChange(e.target.name, e.target.value);
  }

  return (
    <div className="filters">
      <label className="field field-wide">
        Search
        <input
          type="search"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Title or description"
        />
      </label>

      <label className="field">
        Region
        <select name="region" value={filters.region} onChange={handleChange}>
          <option value="all">All regions</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Difficulty
        <select name="difficulty" value={filters.difficulty} onChange={handleChange}>
          <option value="all">Any difficulty</option>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              {level} of 5
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Status
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="all">Any status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Sort by
        <select name="sort" value={filters.sort} onChange={handleChange}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
