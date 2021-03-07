window.onload = ()=>{
    $("button").on({"touchstart":(e)=>$(e.target).addClass("hover"), "touchend":(e)=>$(e.target).removeClass("hover")});

    $("button.vibrate1").on('touchstart',function(){
        navigator.vibrate(100);
    });
};