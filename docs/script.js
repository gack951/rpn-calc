let stack=["0"], memory=[0,0,0,0,0,0,0,0,0,0], drg=0;
const drg_text=["DEG", "RAD", "GRAD"];
const callbacks={
    button_drg: ()=>{drg=(drg+1)%3}, button_drg_l: ()=>{},
    button_0: ()=>{button_number(0)}, button_0_l: ()=>{},
    button_1: ()=>{button_number(1)}, button_1_l: ()=>{},
    button_2: ()=>{button_number(2)}, button_2_l: ()=>{},
    button_3: ()=>{button_number(3)}, button_3_l: ()=>{},
    button_4: ()=>{button_number(4)}, button_4_l: ()=>{},
    button_5: ()=>{button_number(5)}, button_5_l: ()=>{},
    button_6: ()=>{button_number(6)}, button_6_l: ()=>{},
    button_7: ()=>{button_number(7)}, button_7_l: ()=>{},
    button_8: ()=>{button_number(8)}, button_8_l: ()=>{},
    button_9: ()=>{button_number(9)}, button_9_l: ()=>{},
    button_drop: ()=>{button_drop()}, button_drop_l: ()=>{},
    button_enter: ()=>{button_enter()}, button_enter_l: ()=>{},
}
window.onload = ()=>{
    $('button').each((i,e)=>{
        var timeout, longtouch;
        $(e).bind('touchstart', (ee)=>{
            navigator.vibrate(50);
            timeout = setTimeout(()=>{
                longtouch = true;
                navigator.vibrate(50);
                callbacks[ee.target.id+"_l"]();
                render_display();
            }, 300);
            $(ee.target).addClass("hover");
        }).bind('touchend', (ee)=>{
            clearTimeout(timeout);
            if (!longtouch) {
                callbacks[ee.target.id]();
                render_display();
            }
            longtouch = false;
            $(ee.target).removeClass("hover");
        });
    });
    render_display();
};
function render_display(){
    if(memory[0]!=0){
        $("#m").text("M");
    }
    $("#drg").text(drg_text[drg]);
    $("#stack_count").text("STACK: "+stack.length);
    [0,1,2,3].forEach((v,i,a)=>{
        $("#stack"+(i+1)).text(v<stack.length?stack[v]:"");
    })
}
function button_number(number){
    stack[0]=parseInt(stack[0]+number).toString();
}
function button_drop(){
    stack.shift();
    if(stack.length==0){
        stack.push(0);
    }
}
function button_enter(){
    stack.unshift(stack[0]);
}