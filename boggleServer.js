//charades server
comms = require("allgameplugin")
io = comms.createServer({keepSockets:true, standAlonePort:8080},(gameID)=>{return true})
app = comms.clientFiles()
app.use("./htmlBoggle")
players={}

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
    basegame:standardGames.boggleDice_Classic,
    time:3
}
var diceOrder=[];
var compairWords=false
var nodes=[]
var checkedwords={}
var grade=false

io.sockets.on("connection", function(socket) {
    if(players[socket.id]==undefined){
        players[socket.id]={
            mywords:new Set(),
            name:socket.id,
            symbol:String.fromCharCode(33+Object.keys(players).length)
        }
    }
    socket.on("onReConnect",(data)=>{players[socket.id].name=(data!=undefined)?data:socket.id;console.log('myname',data)})
    socket.on('getLetters',()=>{
        players[socket.id].mywords=new Set()
        diceOrder=[];
        let gameVals=options.basegame
        let total=gameVals.rows*gameVals.cols
        let avalibleDice=Array.from(Array(total).keys())
        for(i = 0;i<total;i++){
            let nextDie = avalibleDice.splice(Math.floor(Math.random()*(total-i)),1)
            let letter = gameVals.letters[nextDie][Math.floor(Math.random()*6)]
            if(gameVals.subs[letter]!=undefined){
                letter = gameVals.subs[letter]
            }
            diceOrder.push(letter)
            nodes.push({letter:letter,neighbors:[],position:i})
        } 
        for(let i=0;i<nodes.length;i++){
            nodes[i].neighbors=[
                nodes[i-1],nodes[i+1],
                nodes[i-1-gameVals.cols],nodes[i-gameVals.cols],nodes[i-gameVals.cols+1],
                nodes[i+gameVals.cols-1],nodes[i+gameVals.cols],nodes[i+gameVals.cols+1]
            ]
        }
        io.sockets.emit('gameBoard',{rows:gameVals.rows,cols:gameVals.cols,letters:diceOrder})
        countTime=options.time-1
        io.sockets.emit("time",countTime)
        var x = setInterval(function() {
            countTime-=1
            if (countTime < 0) {
                clearInterval(x);
                io.sockets.emit('gameBoard',{rows:0,cols:0,letters:[" "]})
            }else{
                io.sockets.emit("time",countTime)
            }
        }, 60000);
        compairWords=false
        io.sockets.emit('wordList',{dictionary:{},wordLists:[{words:Array.from(players[socket.id].mywords),symbol:"",name:"me"}]})
    });
    socket.on("oldLetters",()=>{
        let gameVals=options.basegame
        io.sockets.emit('gameBoard',{rows:gameVals.rows,cols:gameVals.cols,letters:diceOrder})
        compairWords=true
        sendWords(socket)
    });
    socket.on("boggleWord",(text)=>{
        let numwords=players[socket.id].mywords.size
        for(word of text.split(" ")){
            players[socket.id].mywords.add(word)
            //checkedwords[word]=isValidWord(word)
        }
        if(players[socket.id].mywords.size>numwords){
            sendWords(socket)
        }
        
    })
    socket.on(grade,()=>{grade^=grade})
    socket.on("clearWords",()=>{players[socket.id]=new Set()})
    console.log(socket.id)

})

function sendWords(socket){
    if(compairWords){
        let emitList=Object.values(players).map((player)=>{
            return {words:Array.from(player.mywords),symbol:player.symbol,name:player.name}
        })
        io.sockets.emit('wordList',{dictionary:grade ? checkedwords : {} ,wordLists:emitList})
    }else{
        socket.emit('wordList',{dictionary:{},wordLists:[{words:Array.from(players[socket.id].mywords),symbol:"",name:"me"}]})
    }
}

function isValidWord(word){
    let letters=word.toUpperCase().split("")
    if(letters.reduce((previousVal,currentVal)=>{return previousVal&&(diceOrder.some(letter=>letter==currentVal.toUpperCase()))},true)){
        let firstletters=nodes.filter(node=>node.letter==letters[0])
        let positions=[]
        firstletters.forEach(firstletter => {
            let secondletters=[]
            secondletters.push(...firstletter.neighbors.filter(node=>node.letter==letters[1]))
            secondletters.forEach(secondletter=>{
                let lastletters=[]
                lastletters.push(...secondletter.neighbors.filter(node=>node.letter==letters[2]))
                positions.push(lastletters.map(((lastletter)=>{
                    return [firstletter.position,secondletter.position,lastletter.position]
                })))                
            })
        });
        return positions
    }else{
        return undefined
    }
}


