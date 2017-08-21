/* 
 * Käsekästchen
 * (c) 2017 by Willi Commer (wcs)
 * Version 1.0
 * 
 */

// field border id
const KK_SIDE_LEFT   = 0;
const KK_SIDE_RIGHT  = 1;
const KK_SIDE_TOP    = 2;
const KK_SIDE_BOTTOM = 3;
const KK_SIDE_NAMES  = ['left','right','top','bottom'];

// auto play level
const KK_LEVEL_DUMMY      = 0;
const KK_LEVEL_SIMPLE     = 1;
const KK_LEVEL_GOOD       = 2;
const KK_LEVEL_NAMES      = ["DUMMY","SIMPLE","GOOD"];

// player id
const KK_PLAYER_NONE      = 0;
const KK_PLAYER_USER      = 1;
const KK_PLAYER_COMPUTER  = 2;
const KK_PLAYER_NAMES     = ["NONE","USER","COMPUTER"];



function kkGame() {
  
//  const DEFAULT_SIZE          = 6;
//  const DEFAULT_PLAY_LEVEL    = KK_LEVEL_SIMPLE;
  const DEFAULT_SIZE          = 4;
  const DEFAULT_PLAY_LEVEL    = KK_LEVEL_GOOD;
  
  // values returned by getStrikeScore()
  const SCORE_NONE            = 0;
  const SCORE_SIMPLE          = 1;
  const SCORE_COMPLETE        = 10;
  
  // values returned by makeStrike()
  const STRIKE_RESULT_NONE    = 0;
  const STRIKE_RESULT_SIMPLE  = 1;
  const STRIKE_RESULT_COPLETE = 2;
  
  var fieldsPerRow = DEFAULT_SIZE;
  var fields = [];
  var baks = [];
  var playLevel = DEFAULT_PLAY_LEVEL;

  // set public functions
  this.getFieldsPerRow    = getFieldsPerRow;
  this.setFieldsPerRow    = setFieldsPerRow;
  this.getPlayLevel       = getPlayLevel;
  this.setPlayLevel       = setPlayLevel;
  this.getFields          = getFields;
  this.setFields          = setFields;
  this.initGame           = initGame;
  this.canUndo            = canUndo;
  this.saveGame           = saveGame;
  this.restoreGame        = restoreGame;
  this.userStrike         = userStrike;
  this.autoPlay           = function(user) { computerStrike(playLevel, user); };
  this.getScore           = getScore;

  //
  // public funtions
  //
  //    
  // return fields 
  function getFields() { 
    return fields; 
  };

  // set fields used by saveGame
  function setFields(value) { 
    fields = new Array();
    for(var i=0; i < value.length; i++)
      fields.push(value[i].clone());
  };

  function getFieldsPerRow() { 
    return fieldsPerRow; 
  };
  
  function setFieldsPerRow(value) {
    if(typeof value === "string") value = parseInt(value);
    fieldsPerRow = value; 
  };
  
  function getPlayLevel() { 
    return playLevel; 
  };
  
  function setPlayLevel(value) { 
    if(typeof value === "string") value = parseInt(value);
    playLevel = value; 
  };

  // start new Game
  function initGame() {
    var x,y,id,f;
    
    // console.log("initGame()"," fieldsPerRow:", fieldsPerRow, " playLevel:", playLevel);
    fields = new Array();
    baks = new Array();
    id = 0;
    for(y=0; y < fieldsPerRow; y++ ) 
      for(x=0; x < fieldsPerRow; x++ ) {
        f = new kkField(x,y,id++);
        if(y === 0) f.topSide = true;
        if(y === fieldsPerRow-1) f.bottomSide = true;
        if(x === 0) f.leftSide = true;
        if(x === fieldsPerRow-1) f.rightSide = true;
        fields.push(f);
      };
  };

  // is restoreGame() possible
  function canUndo() {
    return baks.length > 0;
  };

  // save game values to the stack
  function saveGame() {
    var g = new kkGame();
    g.setFieldsPerRow(fieldsPerRow);
    // g.initGame();
    g.setFields(fields);
    baks.push(g);
  };

  
  // restore game values from stack
  function restoreGame() {
    if(baks.length === 0) 
      return false;
    var g = baks.pop();
    setFields(g.getFields());
  };


  
  
  // execute a user strike for line of a field followed by a automatically 
  // computer strike. "field" is a kkField object and values for "line" 
  // are KK_SIDE_LEFT .. KK_SIDE_BOTTOM
  
  function userStrike(field, line) {
    var strikeresult;
    
    if(!isPosibleStrike(field, line))
      return false; // exit if impossible strike
    
    saveGame();
    strikeresult = makeStrike(field, line, KK_PLAYER_USER);
    if(strikeresult !== STRIKE_RESULT_COPLETE) 
      automaticStrike(playLevel, KK_PLAYER_COMPUTER);
    return true;
  };
  
  
  // execute a calculated strike for user and then for computer
  // this is used in global funcion autoPlay()
  
  function computerStrike(level, user) {
    var i;
    if(!user) user = KK_PLAYER_COMPUTER;
    // console.log("computerStrike(",KK_LEVEL_NAMES[level],",",KK_PLAYER_NAMES[user],")");
    saveGame();
    i = automaticStrike(level, user);
    if(i === 0) {
      restoreGame();
    } else {
      if(user === KK_PLAYER_USER)
      i = automaticStrike(level, KK_PLAYER_COMPUTER);
    };  
  };
  
  
  //
  // private functions
  //
  

  // try to set a line of a field and its neighbor
  // returns STRIKE_RESULT_NONE || STRIKE_RESULT_SIMPLE || STRIKE_RESULT_COMPLETE
  function makeStrike(field, line, user) {
    var result, neighbor, neighborline;
    
    if(!isPosibleStrike(field, line))
      return STRIKE_RESULT_NONE; // exit if impossible strike
    
    field.setLine(line, true);  // set the strike
    if(field.isComplete()) {
      field.owner = user;
      result = STRIKE_RESULT_COPLETE;
    } else {
      result = STRIKE_RESULT_SIMPLE;
    };  
    
    // check neighbor field
    neighbor = getNeighborField(field, line);
    if(neighbor) {
      neighborline = getNeighborLine(line);
      if(isPosibleStrike(neighbor, neighborline)) {
        neighbor.setLine(neighborline, true);
        if(neighbor.isComplete()) {
          neighbor.owner = user;
          result = STRIKE_RESULT_COPLETE;
        };  
      };  
    };  
    
    return result;  
  };
  

  // execute a calculated strike and return the number of stiked lines
  function automaticStrike(level, user) {
    var strikeresult, strike;
    var count = 0;
    do {
      strike = getCalculatetedStrike(level, user);
      if(strike) {
        strikeresult = makeStrike(fields[strike.id], strike.line, user);
        count++;
      } else {
        strikeresult = STRIKE_RESULT_NONE;
      };
    } while (strikeresult === STRIKE_RESULT_COPLETE);
    return count;
  };


  // get field by x,y coordinates
  function getFieldXY(x,y) {
    if((x < 0) || (x >= fieldsPerRow) || (y < 0) || (y >= fieldsPerRow))
      return null;
    var id = y * fieldsPerRow + x;
    return fields[id];
  };

  // get the neighbor field of a line
  function getNeighborField(field, line) {
    switch(line) {
      case KK_SIDE_LEFT: return getFieldXY(field.x-1, field.y); break;
      case KK_SIDE_RIGHT: return getFieldXY(field.x+1, field.y); break;
      case KK_SIDE_TOP: return getFieldXY(field.x, field.y-1); break;
      case KK_SIDE_BOTTOM: return getFieldXY(field.x, field.y+1); break;
    };
    return null;
  };
 
  // convert line to neighbor line 
  function getNeighborLine(line) {
    switch(line) {
      case KK_SIDE_LEFT: return KK_SIDE_RIGHT; break;
      case KK_SIDE_RIGHT: return KK_SIDE_LEFT; break;
      case KK_SIDE_TOP: return KK_SIDE_BOTTOM; break;
      case KK_SIDE_BOTTOM: return KK_SIDE_TOP; break;
    };
    return null;
  };
  
  
  function isPosibleStrike(field, line) {
    return (field && (field.owner === 0) && !field.getLine(line));
  };
  
  // return a simple strike rating
  function getStrikeScore(field, line) {
    result = SCORE_NONE;
    if(!isPosibleStrike(field, line)) return SCORE_NONE;
    if(field.isCompleteExept(line)) return SCORE_COMPLETE;
    return SCORE_SIMPLE;
  };
  
  
  // return a list of possible strikes like
  // {list: [{id: 1, line: 1, score: 1}], bestscore: 1}
  function MakeStrikeMap() {
    var result = new Array();
    var i, field, line, score, bestscore, neighbor;
    
    bestscore = SCORE_NONE;
    for(i=0; i < fields.length; i++) {
      field = fields[i];
      for(line=KK_SIDE_LEFT; line <= KK_SIDE_BOTTOM; line++) {
        score = getStrikeScore(field, line);
        neighbor = getNeighborField(field, line);
        if(neighbor)
          score += getStrikeScore(neighbor, getNeighborLine(line));
        if(score !== SCORE_NONE) {
          result.push( {id: field.id, line: line, score: score} );
          if(score > bestscore)
            bestscore = score;
        };  
      };
    };
    return {list: result, bestscore: bestscore};
  };

  
  // return object like {id: 5, line: 1, score: 1} for the best strike
  // return null if no strike possible
  function getCalculatetedStrike(level, user) {
    var i,strikeMap, bestStrikes, strike;
    var user2, sco, bestscore;
    
    strikeMap = MakeStrikeMap();  // make list of possible strikes
    if(strikeMap.list.length === 0)
      return null;
  
    if(!level) level = KK_LEVEL_SIMPLE; //  check level parameter

    // KK_LEVEL_DUMMY: return any possible strike
    if(level === KK_LEVEL_DUMMY) {
      i = Math.floor(Math.random() * (strikeMap.list.length-1));
      return strikeMap.list[i];
    };

    // KK_LEVEL_SIMPLE: return any of the best possible strikes
    if(level === KK_LEVEL_SIMPLE) {
      bestStrikes = strikeMap.list.filter(function(a){ return a.score === strikeMap.bestscore; });
      i = Math.floor(Math.random() * (bestStrikes.length-1));
      return bestStrikes[i];
    };


    // KK_LEVEL_SIMPLE: return a strike with the best result
    if(level === KK_LEVEL_GOOD) {
      if(!user) user = KK_PLAYER_COMPUTER; // check user parameter
      // set user2
      if(user === KK_PLAYER_COMPUTER) user2 = KK_PLAYER_USER; else user2 = KK_PLAYER_COMPUTER;
      bestscore = -10000;
      bestStrikes = strikeMap.list; // all possible strikes
      for(i=0; i < bestStrikes.length; i++) {
        saveGame();
        strike = bestStrikes[i];
        // make user move
        makeStrike(fields[strike.id], strike.line, user);
        // make user2 move
        automaticStrike(KK_LEVEL_SIMPLE, user2);
        // calculate score
        sco = getScore();
        if(user === KK_PLAYER_COMPUTER)
          strike.score = sco.c - sco.u;
        else
          strike.score = sco.u - sco.c;
        if(strike.score > bestscore)
          bestscore = strike.score;
        restoreGame();
      };
      // filter best strikes
      bestStrikes = bestStrikes.filter(function(a){ return a.score === bestscore; });
      // return random of best strikes
      if(bestStrikes.length > 0) {
        i = Math.floor(Math.random() * (bestStrikes.length-1));
        return bestStrikes[i];
      };
    };
    return null; // no strike found
  };

  
  // return an object with count of owned fields for computer and user like
  // {u: 2, c: 1}
  function getScore() {
    var su,sc;
    su = 0;
    sc = 0;
    fields.forEach(function(v) {
      if(v.owner === KK_PLAYER_USER) su++;
      if(v.owner === KK_PLAYER_COMPUTER) sc++;
    });
    return {u: su, c: sc};
  };
  
  
};



/*
 * kkField
 * @param {integer} x
 * @param {integer} y
 * @param {integer} id
 * @returns {kkField}
 */


function kkField(x,y,id) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.leftSide = false;
  this.rightSide = false;
  this.topSide = false;
  this.bottomSide = false;
  this.owner = 0;
  
  this.setLine = function(line, value) {
    // console.log("setLine(",this.x,",",this.y,",", KK_SIDE_NAMES[line], ")");
    if(!value) value = true;
    switch(line) {
      case KK_SIDE_LEFT: this.leftSide = value; break;
      case KK_SIDE_RIGHT: this.rightSide = value; break;
      case KK_SIDE_TOP: this.topSide = value; break;
      case KK_SIDE_BOTTOM: this.bottomSide = value; break;
    }
  };
  
  this.getLine = function(line) {
    switch(line) {
      case KK_SIDE_LEFT: return this.leftSide; break;
      case KK_SIDE_RIGHT: return this.rightSide; break;
      case KK_SIDE_TOP: return this.topSide; break;
      case KK_SIDE_BOTTOM: return this.bottomSide; break;
    }
    return false;
  };

  this.isComplete = function() {
    return this.leftSide && this.rightSide && this.topSide && this.bottomSide;
  };

  this.isCompleteExept = function(line) {
    return  ((line === KK_SIDE_LEFT) || this.leftSide) &&
            ((line === KK_SIDE_RIGHT) || this.rightSide) &&
            ((line === KK_SIDE_TOP) || this.topSide) &&
            ((line === KK_SIDE_BOTTOM) || this.bottomSide);
  };


  this.clone = function() {
    var result = new kkField(this.x, this.y, this.id);
    result.leftSide = this.leftSide;
    result.rightSide = this.rightSide;
    result.topSide = this.topSide;
    result.bottomSide = this.bottomSide;
    result.owner = this.owner;
    return result;
  };
  
};

 