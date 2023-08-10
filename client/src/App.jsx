import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [shows, setShows] = useState([]);

  useEffect(() => {
    // Check if the access_token query param exists in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const error = urlParams.get("error");

    if (accessToken) {
      // Save the access token to localStorage
      localStorage.setItem("access_token", accessToken);

      // Remove the access_token query param from the URL
      urlParams.delete("access_token");
      const newUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
      window.location.reload();
    } else if (error) {
      urlParams.delete("error");
      alert("sorry, cant talk to spotify rn lol");
      const newUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
      window.location.reload();
    }
  }, []);

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/login`
      );
      const data = await response.json();
      window.location.href = data["authorize_url"];
    } catch (error) {
      alert("sorry");
    }
  };

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const access_token = localStorage.getItem("access_token");

    if (!access_token) {
      window.location.reload();
    }

    if (search === "") {
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?type=show%2Cepisode&q=${search}`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${access_token}`,
          }),
        }
      );

      // access_token has expired
      if (response.status === 403) {
        localStorage.clear();
        window.location.reload();
      }

      const data = await response.json();

      if (data.shows.total > 0) {
        setShows(data.shows.items);
        console.log(data);
      } else {
        alert("no results");
      }
    } catch (error) {
      alert("failed to get podcasts");
    }
  };

  const Shows = () => {
    return (
      <div>
        {shows.map((show) => {
          return (
            <div key={show.id}>
              <h3>{show.name}</h3>
              <p>{show.description}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {!localStorage.getItem("access_token") ? (
        <button onClick={onLogin}>login to spotify</button>
      ) : (
        <>
          {" "}
          <h1>search for podcasts</h1>
          <input
            type="text"
            name="search"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <button onClick={onSubmitSearch}>go</button>
        </>
      )}
      {shows.length > 0 && <Shows />}
    </>
  );
}

export default App;
