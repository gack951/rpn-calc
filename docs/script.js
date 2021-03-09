let stack=[], memory=[0,0,0,0,0,0,0,0,0,0], drg=0, radix=10;
let stack0_state=0; /* 0: blank, 1: typing, 2: result */
const drg_text=["DEG", "RAD", "GRAD"];
const callbacks={
	button_drg: ()=>{drg=(drg+1)%3}, button_drg_l: ()=>{},
	button_drop: ()=>{button_drop()}, button_drop_l: ()=>{},
	button_0: ()=>{button_number("0")}, button_0_l: ()=>{},
	button_1: ()=>{button_number("1")}, button_1_l: ()=>{},
	button_2: ()=>{button_number("2")}, button_2_l: ()=>{},
	button_3: ()=>{button_number("3")}, button_3_l: ()=>{},
	button_4: ()=>{button_number("4")}, button_4_l: ()=>{},
	button_5: ()=>{button_number("5")}, button_5_l: ()=>{},
	button_6: ()=>{button_number("6")}, button_6_l: ()=>{},
	button_7: ()=>{button_number("7")}, button_7_l: ()=>{},
	button_8: ()=>{button_number("8")}, button_8_l: ()=>{},
	button_9: ()=>{button_number("9")}, button_9_l: ()=>{},
	button_sign: ()=>{button_sign()}, button_sign_l: ()=>{},
	button_dot: ()=>{button_dot()}, button_dot_l: ()=>{},
	button_mul: ()=>{button_mul()}, button_mul_l: ()=>{},
	button_div: ()=>{button_div()}, button_div_l: ()=>{},
	button_add: ()=>{button_add()}, button_add_l: ()=>{},
	button_sub: ()=>{button_sub()}, button_sub_l: ()=>{},
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
	});
	if(!stack[0]&&stack0_state==0){
		$("#stack1").text("0");
	}
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
			if(stack[0].indexOf(".")==-1){
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
	if(stack[0][0]=="-"){
		stack[0]=stack[0].slice(1);
	}else{
		stack[0]="-"+stack[0];
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
function button_enter(){
	if(stack[0]=="error"){
		return;
	}
	stack.unshift(stack[0]);
	stack0_state=0;
}
function button_mul(){
	stack[1]=(parseFloat(stack[1])*parseFloat(stack[0])).toString();
	stack.shift();
	stack0_state=2;
}
function button_div(){
	stack[1]=(parseFloat(stack[1])/parseFloat(stack[0])).toString();
	stack.shift();
	if(!isFinite(stack[0])){
		stack[0]="error";
		stack0_state=0;
	}else{
		stack0_state=2;
	}
}
function button_add(){
	stack[1]=(parseFloat(stack[1])+parseFloat(stack[0])).toString();
	stack.shift();
	stack0_state=2;
}
function button_sub(){
	stack[1]=(parseFloat(stack[1])-parseFloat(stack[0])).toString();
	stack.shift();
	stack0_state=2;
}