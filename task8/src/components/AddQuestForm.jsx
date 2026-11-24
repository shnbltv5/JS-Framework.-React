import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { REGIONS } from "../constants.js";
import { createQuest } from "../features/quests/questsThunks.js";
import { resetCreateStatus } from "../features/quests/questsSlice.js";
import { selectCreateState } from "../features/quests/questsSelectors.js";

const EMPTY_FORM = {
  title: "",
  region: REGIONS[0],
  difficulty: "3",
  reward: "",
  durationDays: "",
  giver: "",
  description: "",
};

function validate(form) {
  const errors = {};
  if (form.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
  if (!(Number(form.reward) > 0)) errors.reward = "Reward must be a positive number.";
  if (!(Number(form.durationDays) >= 1)) errors.durationDays = "Duration must be at least 1 day.";
  if (form.giver.trim().length < 2) errors.giver = "Enter who is posting the quest.";
  if (form.description.trim().length < 10) errors.description = "Description must be at least 10 characters.";
  return errors;
}

export default function AddQuestForm({ onCreated, onCancel }) {
  const dispatch = useDispatch();
  // What the user types is temporary UI state -> local useState, not Redux
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // The request state (pending / rejected) comes from the store
  const create = useSelector(selectCreateState);
  const submitting = create.status === "loading";
  const submitError = create.status === "failed" ? create.error.message : null;

  // A new form starts without the error of the previous attempt
  useEffect(() => {
    dispatch(resetCreateStatus());
  }, [dispatch]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // unwrap(): the result of the thunk as a normal Promise (throws if it was rejected)
    try {
      await dispatch(createQuest(form)).unwrap();
      onCreated();
    } catch {
      // The error is already in the store (createQuest.rejected) and is shown below
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>Post a new quest</h2>

      <label className="field">
        Title
        <input name="title" value={form.title} onChange={handleChange} />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <div className="form-row">
        <label className="field">
          Region
          <select name="region" value={form.region} onChange={handleChange}>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Difficulty
          <select name="difficulty" value={form.difficulty} onChange={handleChange}>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                {level} of 5
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          Reward (gold)
          <input type="number" name="reward" min="1" value={form.reward} onChange={handleChange} />
          {errors.reward && <span className="field-error">{errors.reward}</span>}
        </label>

        <label className="field">
          Duration (days)
          <input type="number" name="durationDays" min="1" value={form.durationDays} onChange={handleChange} />
          {errors.durationDays && <span className="field-error">{errors.durationDays}</span>}
        </label>
      </div>

      <label className="field">
        Posted by
        <input name="giver" value={form.giver} onChange={handleChange} />
        {errors.giver && <span className="field-error">{errors.giver}</span>}
      </label>

      <label className="field">
        Description
        <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      {submitError && (
        <p className="field-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Posting..." : "Post quest"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
