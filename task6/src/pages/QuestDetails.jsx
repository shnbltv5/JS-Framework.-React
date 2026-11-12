import { useParams } from "react-router";
import QuestDetail from "../components/QuestDetail.jsx";

export default function QuestDetails() {
  const { id } = useParams(); // "/quests/12" -> { id: "12" }

  // key resets QuestDetail's state when another quest is opened (/quests/1 -> /quests/2),
  // so the old quest is never shown for the new id.
  return <QuestDetail key={id} id={id} />;
}
