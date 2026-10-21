import { useState } from "react";

const EMPTY_VALUES = {
  title: "",
  hero: "",
  difficulty: "Easy",
  reward: "0",
  location: "",
  deadline: "",
  description: "",
};

// Used for both "create" (initialValues = null) and "edit" (initialValues =
// the quest being edited). The form's fields are local state, controlled
// by the inputs; the parent only hears about them on submit.
export default function QuestForm({
  title,
  submitLabel,
  initialValues,
  busy,
  saving,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() =>
    initialValues
      ? {
          title: initialValues.title,
          hero: initialValues.hero,
          difficulty: initialValues.difficulty,
          reward: String(initialValues.reward),
          location: initialValues.location,
          deadline: initialValues.deadline,
          description: initialValues.description,
        }
      : EMPTY_VALUES
  );
  const [validationError, setValidationError] = useState("");

  function updateField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // do not reload the page

    const reward = Number(values.reward);

    if (!values.title.trim() || !values.hero.trim()) {
      setValidationError("Title and hero are required.");
      return;
    }
    if (values.reward === "" || Number.isNaN(reward) || reward < 0) {
      setValidationError("Reward must be a number, zero or more.");
      return;
    }

    setValidationError("");
    onSubmit({
      title: values.title.trim(),
      hero: values.hero.trim(),
      difficulty: values.difficulty,
      reward,
      location: values.location.trim(),
      deadline: values.deadline,
      description: values.description.trim(),
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{title}</h2>

      <label>
        Title
        <input
          type="text"
          value={values.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </label>

      <label>
        Hero
        <input
          type="text"
          value={values.hero}
          onChange={(e) => updateField("hero", e.target.value)}
        />
      </label>

      <div className="form-row">
        <label>
          Difficulty
          <select
            value={values.difficulty}
            onChange={(e) => updateField("difficulty", e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>

        <label>
          Reward (gold)
          <input
            type="number"
            min="0"
            value={values.reward}
            onChange={(e) => updateField("reward", e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Location
          <input
            type="text"
            value={values.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </label>

        <label>
          Deadline
          <input
            type="date"
            value={values.deadline}
            onChange={(e) => updateField("deadline", e.target.value)}
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          rows="4"
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </label>

      {validationError && (
        <p className="form-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={busy}>
          {saving ? "Saving…" : submitLabel}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
