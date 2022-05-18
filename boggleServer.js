//charades server
comms = require("allgameplugin")
io = comms.createServer({keepSockets:true, standAlonePort:8080},(gameID)=>{return true})
app = comms.clientFiles()
app.use("./htmlBoggle")

standardGames={
    boggleDice_Classic :{rows:4,cols:4,subs:{'1':'Qu'},
        letters: ['AACIOT', 'ABILTY', 'ABJMO1', 'ACDEMP', 'ACELRS', 'ADENVZ', 'AHMORS', 'BIFORX', 'DENOSW', 'DKNOTU', 'EEFHIY', 'EGKLUY', 'EGINTV', 'EHINPS', 'ELPSTU', 'GILRUW']},
    boggleDice_New : {rows:4,cols:4,subs:{'1':'Qu'},
        letters:['AAEEGN', 'ABBJOO', 'ACHOPS', 'AFFKPS', 'AOOTTW', 'CIMOTU', 'DEILRX', 'DELRVY', 'DISTTY', 'EEGHNW', 'EEINSU', 'EHRTVW', 'EIOSST', 'ELRTTY', 'HIMNU1', 'HLNNRZ']},
    boggleDice_Big_Original : {rows:5,cols:5,subs:{'1':'Qu'},
        letters:['AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM', 'AEEGMU', 'AEGMNN', 'AFIRSY', 'BJK1XZ', 'CCENST', 'CEIILT', 'CEIPST', 'DDHNOT', 'DHHLOR', 'DHHLOR', 'DHLNOR', 'EIIITT', 'CEILPT', 'EMOTTT', 'ENSSSU', 'FIPRSY', 'GORRVW', 'IPRRRY', 'NOOTUW', 'OOOTTU']},
    boggleDice_Big_Challenge : {rows:5,cols:5,subs:{'1':'Qu'},
        letters:['AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM', 'AEEGMU', 'AEGMNN', 'AFIRSY', 'BJK1XZ', 'CCENST', 'CEIILT', 'CEIPST', 'DDHNOT', 'DHHLOR', 'IKLM1U', 'DHLNOR', 'EIIITT', 'CEILPT', 'EMOTTT', 'ENSSSU', 'FIPRSY', 'GORRVW', 'IPRRRY', 'NOOTUW', 'OOOTTU']},
    boggleDice_Big_Deluxe : {rows:5,cols:5,subs:{'1':'Qu'},
        letters:['AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM', 'AEEGMU', 'AEGMNN', 'AFIRSY', 'BJK1XZ', 'CCNSTW', 'CEIILT', 'CEIPST', 'DDLNOR', 'DHHLOR', 'DHHNOT', 'DHLNOR', 'EIIITT', 'CEILPT', 'EMOTTT', 'ENSSSU', 'FIPRSY', 'GORRVW', 'HIPRRY', 'NOOTUW', 'OOOTTU']},
    boggleDice_Big_2012 : {rows:5,cols:5,subs:{'1':'Qu'},
        letters:['AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM', 'AEEGMU', 'AEGMNN', 'AFIRSY', 'BBJKXZ', 'CCENST', 'EIILST', 'CEIPST', 'DDHNOT', 'DHHLOR', 'DHHNOW', 'DHLNOR', 'EIIITT', 'EILPST', 'EMOTTT', 'ENSSSU', '123456', 'GORRVW', 'IPRSYY', 'NOOTUW', 'OOOTTU']},
    boggleDice_Super_Big : {rows:6,cols:6,subs:{'0':' ', '1':'Qu', '2':'In', '3':'Th', '4':'Er', '5':'He', '6':'An'},
        letters:['AAAFRS', 'AAEEEE', 'AAEEOO', 'AAFIRS', 'ABDEIO', 'ADENNN', 'AEEEEM', 'AEEGMU', 'AEGMNN', 'AEILMN', 'AEINOU', 'AFIRSY', '123456', 'BBJKXZ', 'CCENST', 'CDDLNN', 'CEIITT', 'CEIPST', 'CFGNUY', 'DDHNOT', 'DHHLOR', 'DHHNOW', 'DHLNOR', 'EHILRS', 'EIILST',
                             'EILPST', 'EIO000', 'EMTTTO', 'ENSSSU', 'GORRVW', 'HIRSTV', 'HOPRST', 'IPRSYY', 'JK1WXZ', 'NOOTUW', 'OOOTTU']}
}

options={
    basegame:standardGames.boggleDice_Classic
}
io.sockets.on("connection", function(socket) {
    socket.on('getLetters',()=>{
        gameVals=options.basegame
        total=gameVals.rows*gameVals.cols
        diceOrder=[]
        avalibleDice=Array.from(Array(total).keys())
        for(i = 0;i<total;i++){
            nextDie = Math.floor(Math.random()*(total-i))
            letter = gameVals.letters[nextDie][Math.floor(Math.random()*6)]
            if(gameVals.subs[letter]!=undefined){
                letter = gameVals.subs[letter]
            }
            diceOrder.push(letter)
        } 
        socket.emit('gameBoard',{rows:gameVals.rows,cols:gameVals.cols,letters:diceOrder})
    });
    console.log(socket.id)
})
