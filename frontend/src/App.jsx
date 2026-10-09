import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [seat, setSeat] = useState("A1");
  const [showTime, setShowTime] = useState("18:30");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/movies`)
      .then(res => {
        if (!res.ok) throw new Error("API unavailable");
        return res.json();
      })
      .then(data => setMovies(data))
      .catch(() => setMessage("Cannot reach backend. Start the backend server and refresh."));
  }, []);

  async function bookTicket(event) {
    event.preventDefault();
    if (!selected) return setMessage("Choose a movie first.");
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selected.id,
          movieTitle: selected.title,
          customerName: name,
          seat,
          showTime
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed.");
      setMessage(`Booking confirmed for ${selected.title}, seat ${seat}. Booking ID: ${data.booking._id}`);
      setName("");
    } catch (error) {
      setMessage(error.message || "Could not create booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">CINEMA • YOUR WAY</p>
        <h1>Find your next <span>favorite film.</span></h1>
        <p className="sub">Browse movies, choose a show, and reserve your seat.</p>
      </header>

      <section>
        <div className="section-heading"><h2>Now showing</h2><span>{movies.length} movies</span></div>
        <div className="movies">
          {movies.map(movie => (
            <button className={`movie ${selected?.id === movie.id ? "active" : ""}`}
              key={movie.id} onClick={() => { setSelected(movie); setMessage(""); }}>
              <div className={`poster poster-${movie.id}`}><span>NOW SHOWING</span><strong>{movie.title}</strong></div>
              <div className="movie-info"><h3>{movie.title}</h3><p>{movie.genre} · {movie.duration}</p><b>₹{movie.price}</b></div>
            </button>
          ))}
        </div>
      </section>

      <section className="booking">
        <h2>Reserve your seat</h2>
        <p className="sub">{selected ? `Selected: ${selected.title}` : "Select a movie above to begin."}</p>
        <form onSubmit={bookTicket}>
          <label>Your name<input value={name} onChange={e => setName(e.target.value)} required placeholder="Enter your name" /></label>
          <div className="form-row">
            <label>Seat
              <select value={seat} onChange={e => setSeat(e.target.value)}>
                {["A1","A2","A3","A4","B1","B2","B3","B4","C1","C2","C3","C4"].map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Show time
              <select value={showTime} onChange={e => setShowTime(e.target.value)}>
                {["12:00","15:30","18:30","21:00"].map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <button className="submit" disabled={!selected || loading}>{loading ? "Booking…" : "Confirm booking"}</button>
        </form>
        {message && <p className="message" role="status">{message}</p>}
      </section>
      <footer>Portfolio starter project · React · Express · MongoDB</footer>
    </main>
  );
}
