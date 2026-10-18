import { avatarFor } from "../constants.js";

export default function QuestAvatar({ id }) {
  return (
    <span className="quest-avatar" aria-hidden="true">
      {avatarFor(id)}
    </span>
  );
}
