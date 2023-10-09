const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// return a list of all the players in the player table

app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT * FROM player_details;`;
  const data = await db.all(getPlayers);
  const updatedData = data.map((each) => ({
    playerId: each.player_id,
    playerName: each.player_name,
  }));
  response.send(updatedData);
});
module.exports = app;

// return a specific player based on playerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT * FROM player_details WHERE player_id=${playerId};`;
  const data = await db.get(getPlayer);
  const updatedData = {
    playerId: data.player_id,
    playerName: data.player_name,
  };
  response.send(updatedData);
});
module.exports = app;

// update the details of specific player based on playerId

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updateDetails = `
    UPDATE player_details
    SET
    
    player_name="${playerName}"
    WHERE player_id=${playerId};`;
  await db.run(updateDetails);
  response.send("Player Details Updated");
});
module.exports = app;

// return the match details of specific match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
    SELECT * FROM match_details
    WHERE match_id=${matchId};`;
  const data = await db.get(getMatchDetails);
  const updatedData = {
    matchId: data.match_id,
    match: data.match,
    year: data.year,
  };
  response.send(updatedData);
});
module.exports = app;

// return all a list of all the matches of a player

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatches = `
    SELECT match_id AS matchId,
    match,
    year
     FROM match_details NATURAL JOIN player_match_score
    WHERE player_id=${playerId};`;

  const data = await db.all(getMatches);
  response.send(data);
});
module.exports = app;

// return a list of players of a specific match

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayers = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details NATURAL JOIN player_match_score
    WHERE match_id=${matchId};`;

  const data = await db.all(getPlayers);
  response.send(data);
});
module.exports = app;

// return the total statics of a specific player with his details

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getStatics = `
    SELECT
    player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM player_details NATURAL JOIN player_match_score
    WHERE player_id=${playerId};`;

  const data = await db.get(getStatics);
  response.send(data);
});
module.exports = app;
