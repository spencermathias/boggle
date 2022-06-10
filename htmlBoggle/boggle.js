let numCols=3
socket=clientComms("localhost:80")
socket.on("connect", function() {console.log(socket.id)})
socket.on("gameBoard",function(data){
    let k=0;
    $("#boggleLetters").empty()
    for(i=0;i<data.rows;i++){
        let rowHTML="<tr>"
        for(j=0;j<data.cols;j++){
            rowHTML+="<td class='boggleBoard'>"+data.letters[k++]+"</td>"
        }
        $("#boggleLetters").append(rowHTML+"</tr>")
    }
    $("#boggleLetters").width(""+(data.cols*52)+"pt")
    console.log(data)
})

socket.on("time",function(minutes){
    console.log("recived"+minutes)
    countTime=59
    let x = setInterval(function() {
        $("#timer")[0].innerHTML = ""+minutes+":"+countTime
        countTime-=1
        if (countTime == 0) {
          clearInterval(x);
          $("#timer")[0].innerHTML = "expired"
        }
    }, 1000);
})
socket.on("wordList",(data)=>{
    let lists = data.wordLists
    if($("#wordLists tr th").length!=lists.length){
        $("#wordLists tr").remove()
        let headerRow="<tr>"
        for(list of lists){
            headerRow+="<th></th><th colspan="+lists.length+">"+list.name+"</th>"
        }
        headerRow+="</tr>"
        $("#wordLists thead").append(headerRow)
    }
    if(lists.length == 1){
        $("#wordLists tbody tr").remove()
        let row="<tr>"
        let i=1
        for (let item of lists[0].words){
            row+="<td>"+item+"</td>"
            if(i==numCols){
                row+="</tr>"
                $("#wordLists tbody").append(row)
                row="<tr>"
            }
            i%=numCols;i++
        }
        row+="</tr>"
        $("#wordLists tbody").append(row)
    }else{
        $("#wordLists tbody tr").remove()
        for(list of lists){
            list.words=new Set(Array.from(list.words).sort((a, b) => a.localeCompare(b)))
        }
        let wordSymbolLists=lists.map((value,i,arr)=>{
            return [...value.words].map((word)=>{
                let wordSymbols=[]
                for(let list_Ind in arr){
                    if(list_Ind!=i){
                        if(arr[list_Ind].words.has(word)){
                            wordSymbols.push(arr[list_Ind].symbol)
                        }else{
                            wordSymbols.push(" ")
                        }
                    }
                }
                wordSymbols.push(word)
                return wordSymbols
            })
        })
        let length=Math.max(...wordSymbolLists.map((wordList)=>{return wordList.length}))
        for(i=0;i<length;i++){
            let row="<tr>"
            for(j=0;j<wordSymbolLists.length;j++){
                row+='<td width="30pt"></td><td>'
                row+=((wordSymbolLists[j][i]!=undefined)?wordSymbolLists[j][i]:Array(wordSymbolLists.length).fill(" ")).join("</td><td>")
                row+='</td>'
            }
            row+='</tr>'
            $("#wordLists tbody").append(row)
        }
    }
})
socket.on("grade",(data)=>{
    data.validWords
    data.points

})
$("#newBoard").click(function(){socket.emit("getLetters")})
$("#oldBoard").click(function(){socket.emit("oldLetters")})
$('#submit').click(function(){socket.emit('message',$('#submit').val())})
sendMessage=function(){
	message=$('#message').val()         
	socket.emit("boggleWord",message); 
	$('#message').val('');
	return false;
};
