function test(){
    
}
function test1(){
    
}

var a = {
    getState:function(a,b,c){
        'a,b,c';
        console.log(2);
    }
}

var b = {
    getState(a,b,c){
        'a,b,c';
        console.log(2);
    }
}

class A{
    getState(a,b,c){
        'a,b,c';
        console.log(2);
    }
}