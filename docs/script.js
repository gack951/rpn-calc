let stack=[], memory=[0,0,0,0,0,0,0,0,0,0], drg=0, radix=10;
let stack0_state=0; /* 0: blank, 1: typing, 2: result */
const drg_text=["DEG", "RAD", "GRAD"];
const callbacks={
	button_drg: ()=>{change_drg(false)}, button_drg_l: ()=>{change_drg(true)},
	button_drop: ()=>{button_drop()}, button_drop_l: ()=>{},
	button_swap: ()=>{button_swap()}, button_swap_l: ()=>{},
	button_0: ()=>{button_number("0")}, button_0_l: ()=>{},
	button_1: ()=>{button_number("1")}, button_1_l: ()=>{input_const(Math.PI)},
	button_2: ()=>{button_number("2")}, button_2_l: ()=>{input_const(Math.E)},
	button_3: ()=>{button_number("3")}, button_3_l: ()=>{},
	button_4: ()=>{button_number("4")}, button_4_l: ()=>{},
	button_5: ()=>{button_number("5")}, button_5_l: ()=>{},
	button_6: ()=>{button_number("6")}, button_6_l: ()=>{},
	button_7: ()=>{button_number("7")}, button_7_l: ()=>{},
	button_8: ()=>{button_number("8")}, button_8_l: ()=>{},
	button_9: ()=>{button_number("9")}, button_9_l: ()=>{},
	button_sign: ()=>{button_sign()}, button_sign_l: ()=>{},
	button_dot: ()=>{button_dot()}, button_dot_l: ()=>{},
	button_exp: ()=>{button_exp()}, button_exp_l: ()=>{},
	button_back: ()=>{button_back()}, button_back_l: ()=>{},
	button_mul: ()=>{arithmetic((y,x)=>y*x)}, button_mul_l: ()=>{},
	button_div: ()=>{arithmetic((y,x)=>y/x)}, button_div_l: ()=>{},
	button_add: ()=>{arithmetic((y,x)=>y+x)}, button_add_l: ()=>{},
	button_sub: ()=>{arithmetic((y,x)=>y-x)}, button_sub_l: ()=>{},
	button_enter: ()=>{button_enter()}, button_enter_l: ()=>{},
	button_sin: ()=>{math_function(Math.sin, true, false)}, button_sin_l: ()=>{math_function(Math.asin, false, true)},
	button_cos: ()=>{math_function(Math.cos, true, false)}, button_cos_l: ()=>{math_function(Math.acos, false, true)},
	button_tan: ()=>{math_function(Math.tan, true, false)}, button_tan_l: ()=>{math_function(Math.atan, false, true)},
	button_ln:  ()=>{math_function(Math.log, false, false)}, button_ln_l: ()=>{math_function(Math.exp, false, false)},
	button_log: ()=>{math_function(Math.log10, false, false)}, button_log_l: ()=>{math_function((x)=>Math.pow(10,x), false, false)},
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
	$("div#display").on('touchstart', (e)=>{
		copy_to_clipboard(0);
		flash_stack(0,"copied");
	})
	render_display();
};
function render_display(){
	if(memory[0]!=0){
		$("#m").text("M");
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
function arithmetic(f){
	stack[1]=f(parseFloat(stack[1]),parseFloat(stack[0])).toString();
	stack.shift();
	stack0_state=2;
}
function math_function(func, in_drg, out_drg){
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
			case 0:	// DEG
				stack[0]=(x*Math.PI/180).toString();
				break;
			case 1:	// RAD
				stack[0]=(x*200/Math.PI).toString();
				break;
			case 2:	// GRAD
				stack[0]=(x*180/200).toString();
				break;
		}
	}
	drg=(drg+1)%3;
}
function input_const(value){
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