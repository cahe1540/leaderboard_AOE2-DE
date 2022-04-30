/*******************
/****fetch ladders
 *******************/
class ladders {
  constructor() {
    /*
     * 0 = unranked
     * 1 = ranked dm 1v1
     * 2 = ranked dm
     * 3 = ranked 1v1
     * 4 = ranked tg
     */
    this.ladder;
  }

  async getLeaderBoard(type) {
    try {
      let ret = await fetch(
        `https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=${type}&start=1&count=10000`
      );
      this.ladder = await ret.json();

      return this;
    } catch (error) {
      console.log(error);
    }
  }
}
/***************
/***leaderboard view functions
 ***************/

//render a single cell of leaderboard
const renderCell = (player) => {
  const markup = `
		<tr class="player-entry">
    		<td class = "player-rank">${player.rank}</td>
    		<td>${player.rating}</td>
    		<td><a href="javascript:;" class= "player">${player.name}</a></td>
    		<td>${player.games}</a></td>
			<td>${(100 * Math.round((100 * player.wins) / player.games)) / 100}%</td>
  		</tr>`;

  document
    .querySelector(".leaderboards")
    .getElementsByTagName("tbody")[0]
    .insertAdjacentHTML("beforeend", markup);

  //fix position of popup
  document.querySelector(".disabled").style.bottom = "150rem";
};

//update leaderboard page navigation buttons
const addLeaderBoardButtons = (page, numResults, resPerPage = 100) => {
  const pages = Math.ceil(numResults / resPerPage);
  let markup;
  markup = createButtons(page, pages);

  document
    .querySelector(".leaderboards")
    .insertAdjacentHTML("afterend", markup);
};

//remove leaderboard page navigation buttons
const removeLeaderBoardButtons = () => {
  const elem = document.querySelector(".leaderboard-footer");
  if (elem !== null) elem.parentNode.removeChild(elem);
};

//function that should be called when a leaderboard type button is
const updateLeaderBoardUI = (targetEl) => {
  //remove all highlighted butons
  removeHighlightedBtns();

  //highlight correct button
  targetEl.parentNode.className = "selected";

  //rename leaderboard title
  document.querySelector(".l-title").innerHTML = targetEl.innerHTML;

  //remove leaderboard buttons
  removeLeaderBoardButtons();

  //remove old leaderboard
  removeLeaderBoard();
};

//render the correct leaderboard to ui
const updateLeaderBoard = (ladder, currentPage) => {
  //clear old navigation buttons
  removeLeaderBoardButtons();

  //remove old leaderboard
  removeLeaderBoard();

  //upate new ladder
  renderTable(ladder, currentPage);

  //render updated leaderboard navigation buttons
  addLeaderBoardButtons(currentPage, ladder.length);
};

//remove current page of leaderboard
const removeLeaderBoard = () => {
  const elem = document.querySelectorAll(".player-entry");

  elem.forEach((cur) => {
    cur.parentNode.removeChild(cur);
  });
};

//calculate what numbers to put on leaderboard navigation buttons
const createButtons = (page, pages) => {
  let next1 = page + 1;
  let prev1 = page - 1;

  if (page === 1) {
    prev1 = "";
    page = 1;
    next1 = 2;
  }

  if (page === pages) {
    next1 = "";
    prev1 = page - 1;
  }

  return `
		<div class="leaderboard-footer">
		  <ul class="leaderboard-btns">
			<li><a href="javascript:;" class="btns-footer">First</a></li>
			<li><a href="javascript:;" class="btns-footer prev"> ${prev1} </a></i>
			<li class = "current-page"> ${page} </li>
			<li><a href="javascript:;" class="btns-footer next"> ${next1} </a></li>
			<li><a href="javascript:;" class="btns-footer">Last</li>
		  </ul>
	    </div>
	`;
};

//render the current page of leaderboard
const renderTable = (leaderBoard, page, resPerPage = 100) => {
  const start = (page - 1) * resPerPage;
  const end = start + resPerPage;

  leaderBoard.slice(start, end).forEach(renderCell);
};

//remove the highlighed current leaderboard type
const removeHighlightedBtns = () => {
  const btns = document
    .querySelector(".leaderboard-options")
    .getElementsByTagName("li");
  for (let i = 0; i < btns.length; i++) {
    btns[i].className = "";
  }
};

//remove the spinner
const removeSpinner = () => {
  document.querySelector(".spinner").innerHTML = "";
};

//add a spinner to notify user that command is processing
const addSpinner = () => {
  const markup = `

  	<div class = "loader">
  		  <i class="fas fa-spinner fa-spin fa-3x"></i>

  	</div>
  	`;

  document.querySelector(".spinner").insertAdjacentHTML("beforeend", markup);
};

/***********************
/*Match History controller
/***********************/
class playerHistory {
  constructor() {
    this.matchHistory;
    this.strings;
  }

  //fetches match history from api
  async getPlayerMatchHistory(playerID) {
    try {
      let ret = await fetch(
        `https://aoe2.net/api/player/matches?game=aoe2de&steam_id=${playerID}&count=10`
      );
      this.matchHistory = await ret.json();
      ret = await fetch(`https://aoe2.net/api/strings?game=aoe2de&language=en`);
      this.strings = await ret.json();
    } catch (error) {
      console.log(error);
    }
    return this;
  }
}

/***********************
/*Match History view
/***********************/

//generate entire match history table
const generateMatchHistory = (matches, strings) => {
  matches.forEach((cur) => {
    renderHistoryCell(cur, strings);
  });
};

//create an individual cell for match history
const renderHistoryCell = (match, strings) => {
  let leaderboard_type, markup, map;
  //generate match tables
  const [team1, team2] = generateTables(match.players);

  //determine leaderboard type
  leaderboard_type = strings.leaderboard[match.leaderboard_id].string;

  //find the string of map type
  for (var i = 0; i < strings.map_type.length; i++) {
    if (strings.map_type[i].id === match.map_type) {
      map = strings.map_type[i].string;
    }
  }

  //markup to add to ui
  markup = `
		<tr class="history-entry">
				<td>${leaderboard_type}</td>
				<td>${match.average_rating}</td>
				<td class="match_info">
					<div class="cell-1}">
					<div class="team-title">Team 1</div>
					<table class="team1}">
						${team1}
					</table>
					</div>
					<div class="cell-1">
					<div className="team-title">Team 2</div>
					<table class="team2">
						${team2}
					</table>
					</div>
				</td>
				<td>${map}</td>
				<td>${match.server}</td>
			</tr>
	`;

  //add to ui
  document
    .querySelector(".matchHistory")
    .getElementsByTagName("tbody")[0]
    .insertAdjacentHTML("beforeend", markup);
};

/*generate the team info for both teams in a nice table
/*returns an array holding data like the following:
/* [  "1200 xyz123  1 
/*     1275 yeti123 2",
/*    "1300 abc657 3
/*     1165 joshmo123 4"]
/* 
*/
const generateTables = (game_players) => {
  //temp variables
  let table1, table2; //store markup for teams1 and 2 in these variables
  let team1 = [],
    team2 = [],
    team3 = [],
    team4 = []; //arrays holding data of team1, team2
  let one = false,
    two = false,
    three = false,
    four = false; //flags indicating if the team number is used

  //iteration variable
  let i = 0,
    j = 0,
    k = 0,
    l = 0;

  //check for 1v1 game types
  if (game_players.length === 2) {
    team1[0] = game_players[0];
    team2[0] = game_players[1];
  }

  //for all other game modes
  else {
    game_players.forEach((cur) => {
      if (cur.team === 1) {
        team1[i] = cur;
        i++;
        one = true;
      } else if (cur.team === 2) {
        team2[j] = cur;
        j++;
        two = true;
      } else if (cur.team === 3) {
        team3[k] = cur;
        k++;
        three = true;
      } else {
        team4[l] = cur;
        l++;
        four = true;
      }
    });
  }

  //generate the markup
  if (one && two) {
    //generate markup
    table1 = generateTeamData(team1);
    table2 = generateTeamData(team2);
    //return markup
    return [table1, table2];
  } else if (one && three) {
    //generate markup
    table1 = generateTeamData(team1);
    table2 = generateTeamData(team3);
    //return markup
    return [table1, table2];
  } else if (one && four) {
    //generate markup
    table1 = generateTeamData(team1);
    table2 = generateTeamData(team4);
    //return marku3
    return [table1, table2];
  } else if (two && three) {
    table1 = generateTeamData(team2);
    table2 = generateTeamData(team3);
    //return markup
    return [table1, table2];
  } else if (two && four) {
    table1 = generateTeamData(team2);
    table2 = generateTeamData(team4);
    //return markup
    return [table1, table2];
  } else if (three && four) {
    table1 = generateTeamData(team3);
    table2 = generateTeamData(team4);
    //return markup
    return [table1, table2];
  }

  //for 1v1 only
  table1 = generateTeamData(team1);
  table2 = generateTeamData(team2);
  //return markup
  return [table1, table2];
};

//generate the markup for each team in the game
const generateTeamData = (team) => {
  let markup = "";
  let x = 0;
  team.forEach((cur) => {
    //console.log(i);
    markup += `
			<tr>
				<td class="box player-${team[x].color}"> ${team[x].color}</td>
				<td> ${team[x].rating}</td>
				<td> ${team[x].name}</td>
				${
          team[x].won === true && team[x].won !== null
            ? '<td> <i class="fas fa-crown"></i><td>'
            : ""
        }
			</tr>
		`;
    x++;
  });
  return markup;
};

const clearMatchHistory = () => {
  const elem = document.querySelectorAll(".history-entry");

  elem.forEach((cur) => {
    cur.parentNode.removeChild(cur);
  });
};

const hideMatchHistory = () => {
  const elem = document.querySelector(".popup");

  elem.className = "popup disabled";
};

const enableMatchHistory = () => {
  const elem = document.querySelector(".popup");

  elem.className = "popup enabled";
};

/***********************
/*SearchController
/***********************/
//function returns steam id of player given the rank of the player
const searchPlayerByRank = (rank, ladder) => {
  const pid = ladder[rank - 1].steam_id;
  return pid;
};

//function returns index of player searched by name
const searchPlayerByName = (name, ladder) => {
  let index = -1;

  //look for the name in the leaderboard
  for (let i = 0; i < ladder.length; i++) {
    if (name.toLowerCase() === ladder[i].name.toLowerCase()) {
      return i;
    }
  }
  return index;
};

/***********************
/*SearchView
/***********************/

//render a single cell of leaderboard
const SearchRenderCell = (player) => {
  const markup = `
		<tr class="player-entry">
    		<td class = "player-rank">${player.rank}</td>
    		<td>${player.rating}</td>
    		<td><a href="javascript:;" class= "player">${player.name}</a></td>
    		<td>${player.games}</a></td>
			<td>${(100 * Math.round((100 * player.wins) / player.games)) / 100}%</td>
  		</tr>`;

  document
    .querySelector(".leaderboards")
    .getElementsByTagName("tbody")[0]
    .insertAdjacentHTML("beforeend", markup);

  //fix match history ui position
  document.querySelector(".disabled").style.bottom = "0";
};

const searchFailMessage = () => {
  const markup = `<tr class= "player-entry"> 
						<td> ----- </td> 
						<td> ----- </td>
						<td> Player not found... </td>
						<td> ----- </td>
						<td> ----- </td>
					</tr>`;

  document
    .querySelector(".leaderboards")
    .getElementsByTagName("tbody")[0]
    .insertAdjacentHTML("beforeend", markup);
};

/***********************
/*MAIN
/***********************/

/*store data in window*/
const state = {};

/*
 * Fetch the data and save in state array
 */
const loadDefaultTable = async () => {
  //create necessary ojbects to render leaderboard
  state.AOELadder = new ladders();
  state.curPage = 1;
  state.history = new playerHistory();
  state.pid = 0;

  //load ladder from api
  addSpinner();
  await state.AOELadder.getLeaderBoard(3).then(() => {
    removeSpinner();
  });

  //update to UI
  renderTable(state.AOELadder.ladder.leaderboard, state.curPage);
  addLeaderBoardButtons(
    state.curPage,
    state.AOELadder.ladder.leaderboard.length
  );
};

loadDefaultTable();

/********************
/*Event Listeners
*********************/

//add event listener to access player info on leaderboard
document.querySelector(".leaderboards").addEventListener("click", async (e) => {
  let player;
  state.matchHistory = [];

  if (e.target.matches(".player")) {
    //innerHTML
    player = e.target.innerHTML;

    //retrieve player rank
    const rank =
      e.target.parentNode.parentNode.querySelector(".player-rank").innerHTML;

    //retrieve the steam_id of player using rank
    state.pid = searchPlayerByRank(rank, state.AOELadder.ladder.leaderboard);

    //get the players match history
    state.matchHistory = await state.history.getPlayerMatchHistory(state.pid);

    //render new match history
    generateMatchHistory(
      state.matchHistory.matchHistory,
      state.matchHistory.strings
    );

    //enable match history to display
    enableMatchHistory();
  }
});

//add event listner to close button of match history
document
  .querySelector(".close-match-history")
  .addEventListener("click", (e) => {
    //prevent default button action
    e.preventDefault();

    //clear match history
    clearMatchHistory();

    //set match history area to invisible again
    hideMatchHistory();
  });

//add event listener to page navigation buttons
window.addEventListener("click", (e) => {
  let clicked, nextPage;

  if (e.target.matches(".btns-footer")) {
    clicked = e.target.innerHTML;

    //go to first page of players
    if (clicked === "First") {
      state.curPage = 1;
      //update to UI
      updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);
    }
    //go to the last page of players
    else if (clicked === "Last") {
      state.curPage = Math.ceil(
        state.AOELadder.ladder.leaderboard.length / 100
      );
      updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);
    } //go to page of the number pressed
    else {
      state.curPage = parseInt(clicked);
      updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);
    }
  }
});

//add event listener to change leaderboard type buttons
const el = document
  .querySelector(".leaderboard-options")
  .getElementsByTagName("a");
for (let i = 0; i < el.length; i++) {
  el[i].addEventListener("click", (e) => {
    //update state
    state.curPage = 1;
    if (e.target.innerHTML === "Unranked") {
      //show loadin spinner
      addSpinner();

      //update ladder type
      state.AOELadder.getLeaderBoard(0).then(() => {
        //update to ui
        updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);

        //remove loading spinner
        removeSpinner();
      });
      //update rest of UI
      updateLeaderBoardUI(e.target);
    }

    if (e.target.innerHTML === "Ranked DM 1v1") {
      //show loading spinner
      addSpinner();

      //update ladder type
      state.AOELadder.getLeaderBoard(1).then(() => {
        //update to ui
        updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);

        removeSpinner();
      });
      //update rest of UI
      updateLeaderBoardUI(e.target);
    }
    if (e.target.innerHTML === "Ranked DM TG") {
      //show loading spinner
      addSpinner();

      //update ladder type
      state.AOELadder.getLeaderBoard(2).then(() => {
        //update to ui
        updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);

        removeSpinner();
      });
      //update rest of UI
      updateLeaderBoardUI(e.target);
    }
    if (e.target.innerHTML === "Ranked 1v1") {
      //show loading spinner
      addSpinner();

      //update ladder type
      state.AOELadder.getLeaderBoard(3).then(() => {
        //update to ui
        updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);

        removeSpinner();
      });
      //update rest of UI
      updateLeaderBoardUI(e.target);
    }
    if (e.target.innerHTML === "Ranked TG") {
      //show loading spinner
      addSpinner();

      //update ladder type
      state.AOELadder.getLeaderBoard(4).then(() => {
        //update to ui
        updateLeaderBoard(state.AOELadder.ladder.leaderboard, state.curPage);

        removeSpinner();
      });
      //update rest of UI
      updateLeaderBoardUI(e.target);
    }
  });
}

//add event listener for search input box
document.querySelector(".find").addEventListener("click", (e) => {
  //prevent any default behavior
  e.preventDefault();

  //retrieve text in search box
  let searchBox = document.querySelector(".find-player");

  if (searchBox.value !== "") {
    const index = searchPlayerByName(
      searchBox.value,
      state.AOELadder.ladder.leaderboard
    );

    //if found update ui
    if (index > -1) {
      //remove all unecessary ui elements
      removeLeaderBoard();
      removeLeaderBoardButtons();
      removeHighlightedBtns();

      //load leaderboard with only the indexed player
      SearchRenderCell(state.AOELadder.ladder.leaderboard[index]);
    }

    //if not found tell user query not found
    else {
      //remove all unecessary ui elements
      removeLeaderBoard();
      removeLeaderBoardButtons();
      removeHighlightedBtns();

      //display to user fail to find
      searchFailMessage();
    }

    //clear sarch box
    searchBox.value = "";
  }
});
