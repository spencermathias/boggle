socket=clientComms("localhost:80")
socket.on("connect", function() {console.log(socket.id)})
socket.on("gameBoard",function(data){
    let k=0;
    $("#boggleLetters").empty()
    for(i=0;i<data.rows;i++){
        let rowHTML="<tr>"
        for(j=0;j<data.cols;j++){
            rowHTML+="<td>"+data.letters[k++]+"</td>"
        }
        $("#boggleLetters").append(rowHTML+"</tr>")
    }
    $("#boggleLetters").width(""+(data.cols*52)+"pt")
    console.log(data)
})
$("#newboard").click(function(){socket.emit("getLetters")})
