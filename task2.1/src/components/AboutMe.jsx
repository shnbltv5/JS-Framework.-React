const skills = ["React", "JavaScript", "HTML & CSS", "Git & GitHub", "Python"];

export default function AboutMe() {
  return (
    <section id="about" className="about">
      <h2>About Me</h2>
      <p>
        I'm a final-year Information Systems student at Kazakh-British
        Technical University (KBTU) in Almaty. Right now I'm learning React
        and getting comfortable with modern JavaScript — closures, promises,
        async/await and the event loop — before moving on to building full
        component-based UIs.
      </p>
      <p>
        This page is my first React project: a small self-promotional SPA
        built from scratch and deployed to GitHub Pages.
      </p>

      <h3>Skills</h3>
      <ul className="skills-list">
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}
