let stack=[], stack_history=[["0"]], history_max=10, memory=["0","0","0","0","0","0","0","0","0","0"], drg=0, radix=10, shift=0;
let stack0_state=0; /* 0: blank, 1: typing, 2: result */
let timeout, longtouch;
const drg_text=["DEG", "RAD", "GRAD"];
const callbacks={
	button_shift: ()=>{shift=1}, button_shift_l: ()=>{shift=0},
	button_drg: ()=>{change_drg(false)}, button_drg_l: ()=>{change_drg(true)},
	button_mr: ()=>{input_const(memory[0])}, button_mr_l: ()=>{memory_recall()},
	button_ms: ()=>{memory[0]=stack[0]}, button_ms_l: ()=>{memory_store()},
	button_mplus: ()=>{button_mplus()}, button_mplus_l: ()=>{button_mminus()},
	button_sin: ()=>{trigon_function(Math.sin, true, false)}, button_sin_l: ()=>{trigon_function(Math.asin, false, true)},
	button_cos: ()=>{trigon_function(Math.cos, true, false)}, button_cos_l: ()=>{trigon_function(Math.acos, false, true)},
	button_tan: ()=>{trigon_function(Math.tan, true, false)}, button_tan_l: ()=>{trigon_function(Math.atan, false, true)},
	button_ln:  ()=>{binary_operation((y,x)=>Math.log(x), false)}, button_ln_l: ()=>{binary_operation((y,x)=>Math.exp(x), false)},
	button_log: ()=>{binary_operation((y,x)=>Math.log10(x), false)}, button_log_l: ()=>{binary_operation((y,x)=>Math.pow(10,x), false)},
	button_yx: ()=>{binary_operation((y,x)=>y**x)}, button_yx_l: ()=>{binary_operation((y,x)=>y**(1/x))},
	button_sqrt: ()=>{binary_operation((y,x)=>x**(1/2), false)}, button_sqrt_l: ()=>{binary_operation((y,x)=>x**(1/3), false)},
	button_x2: ()=>{binary_operation((y,x)=>x**2, false)}, button_x2_l: ()=>{binary_operation((y,x)=>x**3, false)},
	button_1x: ()=>{binary_operation((y,x)=>1/x, false)}, button_1x_l: ()=>{binary_operation((y,x)=>y*(x/100), false)},
	button_drop: ()=>{button_drop()}, button_drop_l: ()=>{},
	button_swap: ()=>{button_swap()}, button_swap_l: ()=>{},
	button_0: ()=>{button_number("0")}, button_0_l: ()=>{},
	button_1: ()=>{button_number("1")}, button_1_l: ()=>{input_const(Math.PI)},
	button_2: ()=>{button_number("2")}, button_2_l: ()=>{input_const(Math.E)},
	button_3: ()=>{button_number("3")}, button_3_l: ()=>{binary_operation((y,x)=>(x-y)/y*100)},
	button_4: ()=>{button_number("4")}, button_4_l: ()=>{binary_operation((y,x)=>factorial(x), false)},
	button_5: ()=>{button_number("5")}, button_5_l: ()=>{binary_operation((y,x)=>factorial(y)/factorial(y-x)/factorial(x))},
	button_6: ()=>{button_number("6")}, button_6_l: ()=>{binary_operation((y,x)=>factorial(y)/factorial(y-x))},
	button_7: ()=>{button_number("7")}, button_7_l: ()=>{},
	button_8: ()=>{button_number("8")}, button_8_l: ()=>{},
	button_9: ()=>{button_number("9")}, button_9_l: ()=>{undo()},
	button_sign: ()=>{button_sign()}, button_sign_l: ()=>{},
	button_dot: ()=>{button_dot()}, button_dot_l: ()=>{},
	button_exp: ()=>{button_exp()}, button_exp_l: ()=>{binary_operation((y,x)=>y%x)},
	button_back: ()=>{button_back()}, button_back_l: ()=>{cls()},
	button_mul: ()=>{binary_operation((y,x)=>y*x)}, button_mul_l: ()=>{},
	button_div: ()=>{binary_operation((y,x)=>y/x)}, button_div_l: ()=>{},
	button_add: ()=>{binary_operation((y,x)=>y+x)}, button_add_l: ()=>{},
	button_sub: ()=>{binary_operation((y,x)=>y-x)}, button_sub_l: ()=>{},
	button_enter: ()=>{button_enter()}, button_enter_l: ()=>{},
	overlay_close: ()=>{close_overlay()},
}
window.onload = ()=>{
	$('button').on({
		'touchstart': (ee)=>{
			longtouch = false;
			clearTimeout(timeout);
			if(shift){
				longtouch = true;
				shift=0;
				callbacks[ee.currentTarget.id+"_l"]();
				render_display();
			}else{
				timeout = setTimeout(()=>{
					longtouch = true;
					callbacks[ee.currentTarget.id+"_l"]();
					render_display();
					navigator.vibrate(50);
				}, 300);
			}
			$(ee.currentTarget).addClass("hover");
			navigator.vibrate(50);
		},
		'touchend': (ee)=>{
			clearTimeout(timeout);
			if (!longtouch) {
				callbacks[ee.currentTarget.id]();
				render_display();
			}
			$(ee.currentTarget).removeClass("hover");
		}
	});
	$("div#display").on('touchstart', (e)=>{
		copy_to_clipboard(0);
		flash_stack(0,"copied");
	});
	close_overlay();
	render_display();
};
function render_display(){
	if(memory[0]!="0"){
		$("#m").text("M");
	}else{
		$("#m").text("");
	}
	if(shift){
		$("#shift").text("SHIFT");
	}else{
		$("#shift").text("");
	}
	$("#drg").text(drg_text[drg]);
	$("#stack_count").text("STACK: "+stack.length);
	[0,1,2,3].forEach((v,i,a)=>{
		if(v<stack.length){
			if(stack[v].indexOf("e+")==-1&&parseFloat(stack[v])>=1e10){
				stack[v]=parseFloat(stack[v]).toExponential();
			}
			if(stack[v].indexOf("e+")==-1&&stack[v].indexOf("e-")==-1){
				$("#stack"+(v+1)).text(stack[v].slice(0,stack[v].indexOf(".")==-1?10:11));
				$("#stack"+(v+1)+"_exp").text("");
				$("#stack"+(v+1)+"_exp_base").text("");
			}else if(stack[v].indexOf("e+")!=-1){
				$("#stack"+(v+1)).text(stack[v].slice(0,stack[v].indexOf("e+")).slice(0,stack[v].indexOf(".")==-1?10:11));
				$("#stack"+(v+1)+"_exp").text(("00"+stack[v].slice(stack[v].indexOf("e+")+2)).slice(-3));
				$("#stack"+(v+1)+"_exp_base").text("x10");
			}else if(stack[v].indexOf("e-")!=-1){
				$("#stack"+(v+1)).text(stack[v].slice(0,stack[v].indexOf("e-")).slice(0,stack[v].indexOf(".")==-1?10:11));
				$("#stack"+(v+1)+"_exp").text("-"+("00"+stack[v].slice(stack[v].indexOf("e-")+2)).slice(-3));
				$("#stack"+(v+1)+"_exp_base").text("x10");
			}
		}else{
			$("#stack"+(v+1)).text(v==0?"0":"");
			$("#stack"+(v+1)+"_exp").text("");
			$("#stack"+(v+1)+"_exp_base").text("");
		}
	});
}
function flash_stack(id, str){
	let tmp=$("#stack"+(id+1)).text();
	$("#stack"+(id+1)).text(str);
	setTimeout(()=>{
		$("#stack"+(id+1)).text(tmp);
	}, 500);
}
function button_number(number){
	switch (stack0_state) {
		case 0:
			stack[0]=number;
			stack0_state=1;
			break;
		case 1:
			stack[0]+=number;
			break;
		case 2:
			add_stack_history();
			stack.unshift(number);
			stack0_state=1;
			break;
	}
}
function button_dot(){
	switch (stack0_state) {
		case 0:
			stack[0]="0.";
			stack0_state=1;
			break;
		case 1:
			if(stack[0].indexOf(".")==-1&&stack[0].indexOf("e+")==-1&&stack[0].indexOf("e-")==-1){
				stack[0]+=".";
			}
			break;
		case 2:
			add_stack_history();
			stack.unshift("0.");
			stack0_state=1;
			break;
	}
}
function button_sign(){
	if(!stack[0]){
		return;
	}
	if(stack[0].indexOf("e+")!=-1){
		stack[0]=stack[0].replace("e+", "e-");
	}else if(stack[0].indexOf("e-")!=-1){
		stack[0]=stack[0].replace("e-", "e+");
	}else{
		if(stack[0][0]=="-"){
			stack[0]=stack[0].slice(1);
		}else{
			stack[0]="-"+stack[0];
		}
	}
}
function button_drop(){
	add_stack_history();
	stack.shift();
	if(stack.length==0){
		stack0_state=0;
	}else{
		stack0_state=2;
	}
}
function button_swap(){
	let tmp=stack[0];
	stack[0]=stack[1];
	stack[1]=tmp;
	stack0_state=2;
}
function button_enter(){
	add_stack_history();
	if(stack[0]=="error"){
		return;
	}
	if(!stack[0]){
		stack[0]="0";
	}
	stack[0]=parseFloat(stack[0]).toString();
	stack.unshift(stack[0]);
	stack0_state=0;
}
function button_exp(){
	add_stack_history();
	switch (stack0_state) {
		case 0:
			stack[0]="1e+0";
			stack0_state=1;
			break;
		case 1:
			if(stack[0].indexOf("e+")==-1&&stack[0].indexOf("e-")==-1){
				stack[0]+="e+0";
			}
			break;
		case 2:
			stack.unshift("1e+0");
			stack0_state=1;
			break;
	}
}
function button_back(){
	switch (stack0_state) {
		case 0:
			stack[0]="0";
			stack0_state=0;
			break;
		case 1:
			if(stack[0].slice(-3)=="e+0"||stack[0].slice(-3)=="e-0"){
				stack[0]=stack[0].slice(0,-3);
			}else if(stack[0].slice(-3,-1)=="e+"||stack[0].slice(-3,-1)=="e-"){
				stack[0]=stack[0].slice(0,-1)+"0";
			}else{
				stack[0]=stack[0].slice(0,-1);
			}
			if(!stack[0]){
				stack[0]="0";
				stack0_state=0;
			}
			break;
		case 2:
			stack[0]="0";
			stack0_state=0;
			break;
	}
}
function binary_operation(f, shift=true){
	add_stack_history();
	let y=parseFloat(stack[1]),x=parseFloat(stack[0]);
	if(shift){
		stack.shift();
	}
	stack[0]=f(y,x).toString();
	stack0_state=2;
}
function trigon_function(func, in_drg, out_drg){
	add_stack_history();
	let x=parseFloat(stack[0]);
	if(in_drg){
		switch (drg) {
			case 0:	// DEG
				x=x*Math.PI/180;
				break;
			case 1:	// RAD
				break;
			case 2:	// GRAD
				x=x*Math.PI/200;
				break;
		}
	}
	let y=func(x);
	if(out_drg){
		switch (drg) {
			case 0:	// DEG
				y=y*180/Math.PI;
				break;
			case 1:	// RAD
				break;
			case 2:	// GRAD
				y=y*200/Math.PI;
				break;
		}
	}
	stack[0]=y.toString();
	stack0_state=2;
}
function copy_to_clipboard(id){
	navigator.clipboard.writeText(stack[id]);
}
function change_drg(convert_stack0){
	if(convert_stack0){
		let x=parseFloat(stack[0]);
		switch (drg) {
			case 0:	// DEG→RAD
				stack[0]=(x*Math.PI/180).toString();
				break;
			case 1:	// RAD→GRAD
				stack[0]=(x*200/Math.PI).toString();
				break;
			case 2:	// GRAD→DEG
				stack[0]=(x*180/200).toString();
				break;
		}
	}
	drg=(drg+1)%3;
}
function input_const(value){
	add_stack_history();
	switch (stack0_state) {
		case 0:
			stack[0]=value.toString();
			stack0_state=2;
			break;
		case 1:
		case 2:
			stack.unshift(value.toString());
			stack0_state=2;
			break;
	}
}
function factorial(n) {
	let ret = 1;
	for(let i = 1; i <= n; i++){
		ret *= i;
	}
	return ret;
}
function add_stack_history(){
	stack_history.push(Array.from(stack));
	if(stack_history.length>history_max){
		stack_history.shift();
	}
}
function undo(){
	if(stack_history.length==0){
		return;
	}else{
		stack=stack_history.pop();
		stack0_state=2;
	}
}
function show_overlay(title, titles, values, button=""){
	if(titles.length==0||values.length==0||titles.length!=values.length){
		return;
	}
	$("div#overlay_title").text(title);
	titles.forEach((v,i,a)=>{
		$("div#overlay").append('<div class="overlay_item_wrap"><div class="overlay_item_title">'+v+'</div><div class="overlay_item">'+values[i]+'</div></div>');
	});
	if(button!=""){
		$("div#overlay").append('<button type="button" id="overlay_button">'+button+'</button>');
	}
	$("div#overlay").show();
	$("div#overlay_wrap").show();
}
function close_overlay(){
	$("div#overlay").hide();
	$("div#overlay_wrap").hide();
	$("div#overlay > div.overlay_item_wrap").remove();
	$("div#overlay > button").remove();
}
function button_mplus(){
	memory[0]=(parseFloat(memory[0])+parseFloat(stack[0])).toString();
	stack0_state=2;
}
function button_mminus(){
	memory[0]=(parseFloat(memory[0])-parseFloat(stack[0])).toString();
	stack0_state=2;
}
function memory_recall(){
	show_overlay("Recall Memory", ["M", "1", "2", "3", "4", "5", "6", "7", "8", "9"], memory, "Clear All");
	$("div#overlay > div.overlay_item_wrap").toArray().forEach((v,i,a)=>{
		$(v).on("touchstart", ()=>{
			input_const(memory[i]);
			close_overlay();
			render_display();
		})
	});
	$("div#overlay > button#overlay_button").on("touchstart", ()=>{
		memory=["0","0","0","0","0","0","0","0","0","0"];
		close_overlay();
		render_display();
	});
	stack0_state=2;
}
function memory_store(){
	show_overlay("Store Memory", ["M", "1", "2", "3", "4", "5", "6", "7", "8", "9"], memory, "Clear All");
	$("div#overlay > div.overlay_item_wrap").toArray().forEach((v,i,a)=>{
		$(v).on("touchstart", ()=>{
			memory[i]=stack[0];
			close_overlay();
			render_display();
		})
	});
	$("div#overlay > button#overlay_button").on("touchstart", ()=>{
		memory=["0","0","0","0","0","0","0","0","0","0"];
		close_overlay();
		render_display();
	});
	stack0_state=2;
}
function cls(){
	stack=[];
	stack0_state=0;
}