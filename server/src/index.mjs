import "dotenv/config";
import express from "express";
import cors from "cors";
import SpotifyWebApi from "spotify-web-api-node";

function main() {
  const PORT = process.env.PORT || 4000;
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  });
  const scopes = ["user-read-private", "user-read-email"];

  app.get("/", (_, res) => {
    res.sendStatus(200);
  });

  app.get("/login", (_, res) => {
    const authorizeURL = spotifyApi.createAuthorizeURL(
      scopes,
      "this-is-some-state" // random crypto string
    );

    res.json({ authorize_url: authorizeURL });
  });

  app.get("/callback", async (req, res) => {
    try {
      // retrieve access token
      const data = await spotifyApi.authorizationCodeGrant(req.query.code);
      res.redirect(
        `${process.env.CLIENT_APP_URL}?access_token=${data.body.access_token}`
      );
    } catch (error) {
      console.error(error);
      res.redirect(`${process.env.CLIENT_APP_URL}?state=error`);
    }
  });

  app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`);
  });
}

main();
