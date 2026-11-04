import QuestCard from "./QuestCard.jsx";

export default function QuestList({ quests }) {
  return (
    <div className="grid">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  );
}
