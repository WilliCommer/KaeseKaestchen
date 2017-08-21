angular.module('myApp', [])

.controller('myCtrl',  ['$scope', function($scope) {
  
    const BORDER_STYLE_FREE = "1px dotted rgba(204,31,48,1);";
    const BORDER_STYLE_STOKED = "2px solid rgba(0,0,0,1);";
    const BORDER_STYLE_HIDDEN = "1px none;";
    
    // patch area to hide unused elements
    const hiddenElemets = {
      "btnNewGame": false,
      "btnNewGameC": false,
      "btnAuto": true,
      "btnUndo": false,
      "boardSize10": false,
      "boardSize15": true,
      "skillForm": true,
      "skillFormBr": false,
      "languageForm": false,

      "showAll": false          // set "showAll" = true to show all elements 
    };

//    $scope.language = "en";  // "en" || "de"
    setLanguage(); // set language from Browser
    
    // define field line ids (borders)
    $scope.CROP_LINE_TOP    = KK_SIDE_TOP;
    $scope.CROP_LINE_BOTTOM = KK_SIDE_BOTTOM;
    $scope.CROP_LINE_LEFT   = KK_SIDE_LEFT;
    $scope.CROP_LINE_RIGHT  = KK_SIDE_RIGHT;
   
    // init game
    $scope.game = new kkGame();
    $scope.game.setFieldsPerRow(6);
    $scope.game.setPlayLevel(KK_LEVEL_GOOD);
    $scope.boardSize = "" + $scope.game.getFieldsPerRow();
    $scope.playLevel = "" + $scope.game.getPlayLevel();
    newGame();

    // set parameter for style generators 
    $scope.boardLeft          = 0;
    $scope.boardTop           = 0;
    $scope.boardWidthGap      = 10;
    $scope.fieldWidth         = 50;
    $scope.fieldImageWidth    = 46;

    // user make a strike
    $scope.cropLineClick = function(f,l) {
      $scope.game.setPlayLevel(parseInt($scope.playLevel));
      $scope.game.userStrike(f,l);
    };

    // make automatik user strike
    $scope.autoPlay = function() {
      $scope.game.autoPlay(KK_PLAYER_USER);
    };
  
    // get score
    $scope.getScore = function() {
      return $scope.game.getScore();
    };
    
    // start new game
    $scope.newGame = newGame;

    // computer starts new game
    $scope.newGameC = function() {
      newGame();
      $scope.game.autoPlay(KK_PLAYER_COMPUTER);
    };

    // undo last move
    $scope.undoMove = function() {
      $scope.game.restoreGame();
    };
  
    // get game undo state to hide the undo button 
    $scope.checkUndo = function() {
      return $scope.isHiddenEl("btnUndo") || !$scope.game.canUndo();
    };

    // get text in selected language   
    $scope.getText = function(id) {
      return KK_TEXT[$scope.language][id];
    };
  
    // get width for main panel
    $scope.boardWidth = function() {
      return $scope.game.getFieldsPerRow() * $scope.fieldWidth + $scope.boardWidthGap;
    };

    // css field top
    $scope.fieldTop = function(f) {
      return f.y * $scope.fieldWidth + $scope.boardLeft;
    };
    // css field left
    $scope.fieldLeft = function(f) {
      return f.x * $scope.fieldWidth + $scope.boardLeft;
    };

    $scope.fieldPosStyle = function(f) {
      var s;
      s = "left:" + (f.x * $scope.fieldWidth + $scope.boardLeft) + "px; ";
      s += "top:" + (f.y * $scope.fieldWidth + $scope.boardTop) + "px; ";
      s += "width:" + $scope.fieldWidth + "px; ";
      s += "height:" + $scope.fieldWidth + "px;";
      return s;
    };
  
    $scope.fieldBorderStyleRight = function(f) {
      if(f.rightSide)
        return "border-right: " + BORDER_STYLE_STOKED;
      else
        return "border-right: " + BORDER_STYLE_FREE;
    };

    $scope.fieldBorderStyleLeft = function(f) {
      if(f.x > 0)
        return "border-left: " + BORDER_STYLE_HIDDEN;
      if(f.leftSide)
        return "border-left: " + BORDER_STYLE_STOKED;
      else
        return "border-left: " + BORDER_STYLE_FREE;
    };
  
    $scope.fieldBorderStyleTop = function(f) {
      if(f.y > 0)
        return "border-top: " + BORDER_STYLE_HIDDEN;
      if(f.topSide)
        return "border-top: " + BORDER_STYLE_STOKED;
      else
        return "border-top: " + BORDER_STYLE_FREE;
    };

    $scope.fieldBorderStyleBottom = function(f) {
      if(f.bottomSide)
        return "border-bottom: " + BORDER_STYLE_STOKED;
      else
        return "border-bottom: " + BORDER_STYLE_FREE;
    };


    $scope.fieldImageStyle = function(f) {
      return "width: " + $scope.fieldImageWidth + "px; " +
             "height: " + $scope.fieldFieldWidth + "px; " +
             "padding-left: 4px; padding-top: 4px; ";
             "border: 1;";
    };


    $scope.getFieldImageUrl = function(field) {
      var s = 'empty';
      if(field) {
        if(field.owner === KK_PLAYER_USER) s = 'cross';
        if(field.owner === KK_PLAYER_COMPUTER) s = 'arc';
      };  
      return 'img/' + s + '.png';
    };

    $scope.isHiddenEl = function(id) {
      if(hiddenElemets.showAll)
        return false;
      else
        return hiddenElemets[id];
    };


  
    function setLanguage(value) {
      if(!value) 
        value = navigator.language || navigator.userLanguage; 
      if(!((value === "de") || (value === "en")))
        value = "en";
      $scope.language = value;
    };

  
    function newGame() {
      $scope.game.setPlayLevel($scope.playLevel);
      $scope.game.setFieldsPerRow(parseInt($scope.boardSize));
      $scope.game.initGame();
    };
  
}]);