const contacts = [
  { label: "GitHub", value: "github.com/shnbltv5", href: "https://github.com/shnbltv5" },
  { label: "Instagram", value: "@shnbltv5", href: "https://instagram.com/shnbltv5" },
  { label: "Address", value: "Planet Earth 🌍, Kazakhstan", href: null },
];

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <h2>Contact</h2>
      <ul className="contact-list">
        {contacts.map((c) => (
          <li key={c.label}>
            <span className="contact-label">{c.label}</span>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer">
                {c.value}
              </a>
            ) : (
              <span>{c.value}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
