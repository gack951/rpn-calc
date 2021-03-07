if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service_worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
    });
}
window.onload = ()=>{
    $("button").on({"touchstart":(e)=>$(e.target).addClass("hover"), "touchend":(e)=>$(e.target).removeClass("hover")});

    $("button.vibrate1").on('touchstart',function(){
        navigator.vibrate(50);
    });
};