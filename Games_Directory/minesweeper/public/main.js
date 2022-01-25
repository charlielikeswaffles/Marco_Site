var board = [];
var table = document.getElementById('board');
var bombs = [];
var numBombs = 10;
var dead = false;
var rows = 9;
var cols = 9;
var gameStart = true;
var win = false;
var done = false;

var sec = 0;
var min = 0;
var secStr = '00';
var minStr = '00';
var timer;
var time;
var highScore = 0;

function insertScore(player, score) {
    var url = '/scores/insert';
    var request = new XMLHttpRequest();
    request.addEventListener('load', function () {
        if (this.status !== 200) {
            alert('Error!');
            console.log(this.response);
        }
        else {
            getScores();
        }
    });
    request.open('POST', url, true);
    request.setRequestHeader('Content-type', 'application/json');
    var data = {'player': player, 'score': score};
    request.send(JSON.stringify(data));
}

function getScores() {
    var url = '/scores/top10';

    var request = new XMLHttpRequest();
    request.addEventListener('load', function () {
        var scores = JSON.parse(this.responseText);
        console.log(scores);
        var scoresDiv = document.getElementById('scores');
        scoresDiv.innerHTML = '';
        for (var i = 0; i < scores.length; i++) {
            var scoreTR = document.createElement('TR');
            var TD1 = document.createElement('TD');
            var TD2 = document.createElement('TD');
            var TD3 = document.createElement('TD');
            TD1.innerText = i+1;
            TD2.innerText = scores[i].player;
            TD3.innerText = scores[i].score;
            scoreTR.appendChild(TD1);
            scoreTR.appendChild(TD2);
            scoreTR.appendChild(TD3);
            scoresDiv.appendChild(scoreTR);
        }
    });
    request.open('GET', url, true);
    request.setRequestHeader('Content-type', 'application/json');
    request.send();
}

function num(td) {
    var count = getCount(td);
    td.style.backgroundImage = '';
    td.innerText = count;
    switch(count){
        case 1:
            td.style.color = 'blue';
            break;
        case 2:
            td.style.color = 'green';
            break;
        case 3:
            td.style.color = 'red';
            break;
        case 4:
            td.style.color = 'purple';
            break;
        case 5:
            td.style.color = 'maroon';
            break;
        case 6:
            td.style.color = 'turquoise';
            break;
        case 8:
            td.style.color = 'grey';
            break;
    }

}

function isWin(){
    for(v=0;v<board.length;v++){
        for(q=0;q<board[v].length;q++){
            var td = board[v][q];
            if(!testForBomb(parseInt(td.getAttribute('row')), parseInt(td.getAttribute('col'))) &&
                td.getAttribute('tile') !== 'none'){
                return false;
            }
        }
    }
    return true;
}
function  contains(li, x) {
    for(v=0;v<li.length;v++){
        if(li[v][0] === x[0] && li[v][1] === x[1]){
            return true;
        }
    }
    return false;
}
function click(td){
    var x = parseInt(td.getAttribute('row'));
    var y = parseInt(td.getAttribute('col'));
    if(gameStart){
        gameStart = false;
        var firLi = [[x,y]];
        for(b=0;b<getSorounding(td).length;b++){
            firLi.push([parseInt(getSorounding(td)[b].getAttribute('row')), parseInt(getSorounding(td)[b].getAttribute('col'))])
        }
        bombs.push([Math.floor(Math.random()*rows), Math.floor(Math.random()*cols)]);
        for(bo=0;bo<numBombs;bo++){
            var r = Math.floor(Math.random()*rows);
            var c = Math.floor(Math.random()*cols);
            var bomb = [r,c];
            while((testBombs(bomb) || bombs.length===0) || contains(firLi, bomb)){
                r = Math.floor(Math.random()*rows);
                c = Math.floor(Math.random()*cols);
                bomb = [r,c];
            }
            bombs.push(bomb);
        }
    }
    if(!dead && !win && td.getAttribute('tile') !== 'flag'){
        var around = getSorounding(td);
        var count = 0;
        if(testForBomb(x, y)){
            dead = true;
            board[x][y].style.backgroundImage = "url('png/bomb.png')";
            for(i=0;i<bombs.length;i++){
                board[bombs[i][0]][bombs[i][1]].style.backgroundImage = "url('png/bomb2.png')"
            }
            board[x][y].style.backgroundImage = "url('png/bomb.png')"
        }
        else{
            td.style.backgroundImage = '';
            td.setAttribute('tile', 'none');
            if(getCount(td)>0){
                num(td);
            }
            else{
                for(w=0;w<around.length;w++){
                    around[w].style.backgroundImage = '';
                    around[w].setAttribute('tile', 'none');
                    if(getCount(around[w])>0){
                        num(around[w]);
                    }
                    else{
                        var around2 = getSorounding(around[w]);
                        for(f=0;f<around2.length;f++){
                            if(!isTD(around2[f], around)){
                                around.push(around2[f]);
                            }
                        }
                    }
                }
            }
        }
    }
    if(dead){
        done=true;
        console.log('You died');
        document.getElementById('lose').style.display = 'block';
        document.getElementById('restart').style.display = 'block';
    }
    if(isWin()){
        time = sec + min * 60;
        if(time>highScore){
            highScore = time;
        }
        done=true;
        win=true;
        console.log('You Win');
        for(bo=0;bo<bombs.length;bo++){
            board[bombs[bo][0]][bombs[bo][1]].style.backgroundImage = "url('png/flag.png')"
        }
        document.getElementById('win').style.display = 'block';
        document.getElementById('restart').style.display = 'block';
        document.getElementById('time').innerText = 'You win! your time was ' + time + ' seconds. Enter three initials in the box below'
    }
    if(done){
        clearInterval(timer);
    }
}

function isTD(td, li){
    var x = parseInt(td.getAttribute('row'));
    var y = parseInt(td.getAttribute('col'));
    for(i=0;i<li.length;i++){
        var tx = parseInt(li[i].getAttribute('row'));
        var ty = parseInt(li[i].getAttribute('col'));
        if(x === tx && y === ty){
            return true;
        }
    }
    return false;
}

function getCount(td){
    var li = getSorounding(td);
    var count = 0;
    for(q=0;q<li.length;q++){
        var x = parseInt(li[q].getAttribute('row'));
        var y = parseInt(li[q].getAttribute('col'));
        if(testForBomb(x,y)){
            count ++
        }
    }
    return count;
}

function getSorounding(td){
    var around = [];
    var x = parseInt(td.getAttribute('row'));
    var y = parseInt(td.getAttribute('col'));
    if(x>0){
        around.push(board[x-1][y]);
        if(y>0){
            around.push(board[x-1][y-1])
        }
    }
    if(x<rows){
        around.push(board[x+1][y]);
        if(y<cols){
            around.push(board[x+1][y+1])
        }
    }
    if(y>0){
        around.push(board[x][y-1]);
        if(x<rows){
            around.push(board[x+1][y-1])
        }
    }
    if(y<cols){
        around.push(board[x][y+1]);
        if(x>0){
            around.push(board[x-1][y+1])
        }
    }
    return around;
}

function testBombs (bomb){
    var rep = false;
    for(f=0;f<bombs.length;f++){
        if(bombs[f][0] === bomb[0] && bombs[f][1] === bomb[1]){
            rep = true;
        }
    }
    return rep;
}

function testForBomb(x, y){
    var isBomb = false;
    for(i=0;i<bombs.length;i++){
        if(bombs[i][0] === x && bombs[i][1] === y){
            return true;
        }
    }
    return false;
}

function makeBoard() {
    board = [];
    table.innerHTML = '';
    for(i=0;i<rows+1;i++){
        var boardRow = [];
        var tr = document.createElement('TR');
        for(f=0;f<cols+1;f++){
            var td = document.createElement('TD');
            boardRow.push(td);
            td.setAttribute('row', i);
            td.setAttribute('col', f);
            td.setAttribute('tile', 'square');
            td.style.backgroundImage = "url('png/square.png')";
            td.addEventListener('click', function(e){
                if(gameStart){
                    timer = setInterval(function () {
                        sec ++;
                        if(sec>59){
                            sec = 0;
                            min ++;
                        }
                        secStr = sec;
                        minStr = min;
                        if(sec<10){
                            secStr = '0' + sec;
                        }
                        if(min<10){
                            minStr = '0' + min;
                        }
                        document.getElementById('clock').innerText = minStr + ':' + secStr;
                    }, 1000);
                }
                if(!done){
                    click(e.path[0])
                }
            });
            td.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                if(e.path[0].getAttribute('tile') === 'square'){
                    e.path[0].style.backgroundImage = "url('png/flag.png')";
                    e.path[0].setAttribute('tile', 'flag');
                }
                else if(e.path[0].getAttribute('tile') === 'flag'){
                    e.path[0].style.backgroundImage = "url('png/square.png')";
                    e.path[0].setAttribute('tile', 'square')
                }
            });
            tr.appendChild(td);
        }
        table.appendChild(tr);
        board.push(boardRow);
    }
}
document.getElementById('winForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = document.getElementById('name').value;
    insertScore(name, time);
    getScores();
    document.getElementById('win').style.display = 'none';
    document.getElementById('restart').style.display = 'block';
});
document.getElementById('restart').addEventListener('click', function () {
    dead = false;
    done = false;
    win = false;
    gameStart = true;
    bombs = [];
    minStr = '00';
    secStr = '00';
    min = 0;
    sec = 0;
    document.getElementById('win').style.display = 'none';
    document.getElementById('lose').style.display = 'none';
    document.getElementById('restart').style.display = 'none';
    makeBoard()
});

getScores();
makeBoard();