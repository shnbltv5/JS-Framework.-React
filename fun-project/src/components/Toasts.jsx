import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissNotification } from "../features/cafe/cafeSlice.js";
import { selectNotifications } from "../features/cafe/cafeSelectors.js";

function Toast({ note }) {
  const dispatch = useDispatch();

  // Every message disappears by itself after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissNotification(note.id)), 3500);
    return () => clearTimeout(timer);
  }, [dispatch, note.id]);

  return (
    <li className="toast">
      <span className="toast-emoji" aria-hidden="true">{note.emoji}</span>
      {note.text}
    </li>
  );
}

export default function Toasts() {
  const notes = useSelector(selectNotifications);
  return (
    <ul className="toasts" aria-live="polite">
      {notes.map((note) => (
        <Toast key={note.id} note={note} />
      ))}
    </ul>
  );
}
