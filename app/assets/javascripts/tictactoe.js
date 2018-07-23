// Code your JavaScript / jQuery solution here
$(document).ready(function(){
  turn = 0;
  winningCombinations = [
    [0,1,2], //top row
    [3,4,5], //mid row
    [6,7,8], //bot row
    [0,3,6], //left col
    [1,4,7], //mid col
    [2,5,8], //right col
    [0,4,8], //l>r diag
    [2,4,6]  //r>l diag
  ]

  attachListeners();
});

function attachListeners(){
  //attaches listeners to squares for doTurn(), passes picked on td to doTurn()
  // adds a token to the board
  $('td').click(function(e){
    $(this).html() ? e.preventDefault() : doTurn(this);
  });

  $('#previous').click(function(){
    // get all of the games
    $.get('/games', function(data){
      // pull out the games array from the json response and display them in an unordered list
      const games = data["data"];
      // return if empty
      if (games.length === 0) {
        return;
      }
      $('#games').html(games.map(game => "<button class='previous-game-btn'>" + game["id"] + "</button><br>"));
      // set eventListener for each button
      $('.previous-game-btn').click(function(){
        const id = $(this).html();
        // make another call to the individual game and populate the board
        $.get('/games/' + id.toString(), function(data){
          debugger
          const board = data["data"]["attributes"]["state"];
          const squares = Object.values($('td')).slice(0, 9); //turn jquery obj to array
          for (space in board) {
            //need to use jquery call to use html()
            $(squares[space]).html(board[space]);
          }
          // set data-gameid
          $('table').data('gameid', data["data"]["id"]);
        });
      });
    });
  });

  $('#save').click(function(){
    const boardState = getBoardArray();
    if ($('table').data('gameid')){
      //send patch update
      let id = $('table').data('gameid');
      $.ajax({
        url: '/games/' + id,
        type: 'PATCH',
        data: {'id': id, 'state': boardState},
        success: function(){ console.log('PATCH successful')}
      });
    } else {
      $.post('/games', { 'state': boardState }, function(data){
        // set table data-gameid so next save will send a PATCH req
        $('table').data('gameid', data.data.id);
      });
    }
  });
};

function doTurn(el){
  //increments value of turn variable
  //invokes updateState()
  updateState(el);
  ++turn;
  //check board
  const currentBoard = getBoardArray();
  if (checkWinner(currentBoard)){
    resetGame();
  } else if (checkTie(currentBoard)) {
    setMessage('Tie game.');
    resetGame();
  }
};

function getBoardArray(){
  const currentState = $('td').map(function(index, el) { return el.innerHTML });
  return Object.values(currentState).slice(0,9); // remove those extra elements jquery gets us
};

function player(){
  return turn % 2 === 0 ? "X" : "O";
};

function updateState(el){
  //invokes player() function
  const token = player();
  //adds token to passed-in td element
  $(el).html(token)
};

function setMessage(message){
  //sets provided string as innerHTML of div#message
  $('#message').html(message);
};

function checkWinner(board){
  const stateArray = getBoardArray(); //for some reason board doesn't work here
  let checkResult = false;
  debugger
  winningCombinations.forEach(function(combo){
    let x = combo.filter(index => stateArray[index] === "X");
    let o = combo.filter(index => stateArray[index] === "O");
    if (x.length === 3) {
      setMessage("Player X Won!");
      checkResult = true;
    } else if (o.length === 3) {
      setMessage("Player O Won!");
      checkResult = true;
    }
  });
  return checkResult;
};

function resetGame(){
  //reset game board
  $('td').html('');
  turn = 0;
};

function checkTie(board){
  //const stateArray = getBoardArray();
  // filter out the filled squares
  const filledSquares = board.filter(square => square === '');

  return filledSquares.length === 0 ? true : false
};

function resetGame(){
//reset game board
  $('td').html('');
  turn = 0;
};


// each new game sets turn to 0 and clears board, initiated with
// save game on first try will set data-gameID attr on save button
// loading a new game will set it automatically
