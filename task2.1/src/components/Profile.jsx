export default function Profile() {
  return (
    <section className="profile">
      <img
        className="profile-photo"
        src={`${import.meta.env.BASE_URL}photo.jpg`}
        alt="Aidana Shynbulatova"
      />
      <h1>Aidana Shynbulatova</h1>
      <p className="tagline">
        Information Systems student at KBTU · building things with React
      </p>
    </section>
  );
}
