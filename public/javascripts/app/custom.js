$( document ).ready(function() {
	
	// Copy to Clipboard
	$('.clipboard').tooltip({
		title: 'Copied!',
    	delay: 0,
	  	trigger: 'click',
	  	placement: 'right'
	});

	var clipboard = new ClipboardJS('button');
	clipboard.on('success', function(e) {
		hideTooltip();
	});

	defineCoreRange();

	// mask
	$('#text-vanity').mask('AAAAAAA');

	// vanity form submit
	$( "#vanity-form" ).submit(function( event ) {
		createWallet();
		event.preventDefault();
	});

	// show options on focus
	$("#text-vanity").click(function(){
		var inputDisabled = $('#text-vanity').prop('disabled');
		if(inputDisabled == false){
			if(this.value != ""){
				$(".options").show();
				$(".create-address").show();			
				$("main").addClass("no-margin");
			}else{
				$(".options").hide();
				$(".create-address").hide();			
				$("main").removeClass("no-margin");
			}
		}
	});
	$("#text-vanity").keyup(function(){
		var inputDisabled = $('#text-vanity').prop('disabled');
		if(inputDisabled == false){
			if(this.value != ""){
				$(".options").show();
				$(".create-address").show();			
				$("main").addClass("no-margin");
			}else{
				$(".options").hide();
				$(".create-address").hide();			
				$("main").removeClass("no-margin");
			}
		}
	});

	qrcode
	var qrcodePublic = new QRCode("qrcode" , {
		text: "1FgmtaGshjkgV9oj8uLm6cjWS7jRxknw4J",
		width: 128,
		height: 128,
		colorDark : "#000000",
		colorLight : "transparent",
		correctLevel : QRCode.CorrectLevel.H
	});
	
});

function defineCoreRange(){
	//reset colors
	$.get("/coreNumbers", function(data){
		var slider = document.getElementById("core-slider");
		var output = document.getElementById("core-number");
		output.innerHTML = $("#core-slider").val(); // Display the default slider value		
		$("#core-slider").attr('max', data.length);
		// Update the current slider value (each time you drag the slider handle)
		slider.oninput = function() {
		    output.innerHTML = this.value;
			percentage = this.value*100/data.length;
		    defineEyeColor(percentage);
		}
		var coresNumber = data.length;
	});
}

function refreshEyeColor(){
	$.get("/coreNumbers", function(data){
		var slider = document.getElementById("core-slider");
		var output = document.getElementById("core-number");
		output.innerHTML = $("#core-slider").val(); // Display the default slider value		
		$("#core-slider").attr('max', data.length);
		// Update the current slider value (each time you drag the slider handle)
		percentage = slider.value*100/data.length;
		defineEyeColor(percentage);
	});
}

function defineEyeColor(percentage){
	resetEyeColor();
	if(percentage <= 25){
    	$(".eye").addClass("eye25Percentage");
    }else if(percentage <= 50){
    	$(".eye").addClass("eye50Percentage");
    }else if(percentage <= 75){
    	$(".eye").addClass("eye75Percentage");
    }else if(percentage <= 100){
    	$(".eye").addClass("eye100Percentage");
    }
}
function resetEyeColor(){	
	$(".eye").removeClass("eye25Percentage");
	$(".eye").removeClass("eye50Percentage");
	$(".eye").removeClass("eye75Percentage");
	$(".eye").removeClass("eye100Percentage");
}

function resetCounter(){	
	$('.counter-clock').counter("reset");
}

function startCounter(){
	$('.counter-clock').counter({
		initial: "00:00:00",
	    direction: 'up',
	    format: "23:59:59",
	    interval: 1000
	});
}

function stopCounter(){
	$('.counter-clock').counter("stop");
}

function hideTooltip() {
	setTimeout(function() {
    	$('.clipboard').tooltip('hide');
  	}, 700);
}

function createWallet(){
	var textVanity = $("#text-vanity").val();
	var coresAllowed = $("#core-slider").val();
	var caseSensitive = $("#case-sensitive").val();
	var stringLocation = $("#string-location").val();
	var walletType = $("#wallet-type").val();

	$("body").removeClass("stop-animation");

	// start clock counter
	startCounter();

	// show result
	$(".result-container").show(100);

	if(walletType == 'legacy'){
		$(".result-container .wallet-type span").text('Legacy');
	}else{
		$(".result-container .wallet-type span").text('Segwit');
	}

	if(stringLocation == 'start'){
		$(".result-container .string-location span").text('Start with text');
	}else{
		$(".result-container .string-location span").text('End with text');
	}

	if(caseSensitive == '0'){
		$(".result-container .case-sensitive span").text('No');
	}else{
		$(".result-container .case-sensitive span").text('Yes');
	}

	$(".result-container .core-number span").text(coresAllowed);

	$(".attempts").hide(100);
	$(".address").hide(100);
	$("#vanity-form .options").hide(100);
	refreshEyeColor();

	// validate input text
	if(textVanity != ""){
		
		// change buttons
		$('#text-vanity').prop('disabled', true);
		$('.cancel-address').css("display", "block");
		$('.cancel-address').show(100);
		$('.create-address').hide(100);
		$('.eye').addClass('readEye');

		// ajax call
		$.post("/generateWallet", {
			textVanity: textVanity,
			coresAllowed: coresAllowed,
			caseSensitive: caseSensitive,
			stringLocation: stringLocation,
			walletType: walletType
		}).done(function(data){

			if(data){
				// number of attempts
				$(".attempts span").text(data[2]);

				// public key
				$(".public-key span").text(data[0]);
				$(".public-key .clipboard").attr("data-clipboard-text", data[0]);
				$("#qrcode-btc-public-key").html("");
				var qrcodePublic = new QRCode("qrcode-btc-public-key" , {
					text: data[0],
					width: 128,
					height: 128,
					colorDark : "#000000",
					colorLight : "transparent",
					correctLevel : QRCode.CorrectLevel.H
				});

				// private key (wif)
				$(".private-key span").text(data[1]);
				$(".private-key .clipboard").attr("data-clipboard-text", data[1]);	
				$("#qrcode-btc-private-key").html("");						
				var qrcodeSecret = new QRCode("qrcode-btc-private-key" , {
					text: data[1],
					width: 128,
					height: 128,
					colorDark : "#000000",
					colorLight : "transparent",
					correctLevel : QRCode.CorrectLevel.H
				});

				// change buttons and options				
				$('.cancel-address').hide(100);
				$('.create-address').hide(100);
				$(".options").hide(100);
				$('.new-search').css('display', 'block');
				$(".attempts").show(100);
				$(".address").show(100);				

				// stop animation on background
				$("main").addClass("no-margin");
				$('.eye').removeClass('readEye');
				$("body").addClass("stop-animation");
				
			}else{
				// change buttons
				$('#text-vanity').prop('disabled', false);
				$('.create-address').show(100);
				$('.cancel-address').hide(100);
				$('.new-search').hide(100);

				// show options
				$("#vanity-form .options").show(100);
				$(".result-container").hide(100);
				
				// stop animations
				$('.eye').removeClass('readEye');
				$("body").addClass("stop-animation");
			}
			// reset clock counter
			resetEyeColor();
			stopCounter();
		});
	}
}

function cancelWallet(){
	$.get("/cancelWallet", function(data){
		// reset clock counter
		resetCounter();
		stopCounter();

		// hide elements
		$('.cancel-address').hide(100);
		$('.new-search').hide(100);
		$(".result-container").hide(100);

		// show elements
		$('.create-address').show(100);
		$("#vanity-form .options").show(100);
		
		// stop animations
		$('.eye').removeClass('readEye');
		$("body").addClass("stop-animation");
		
		$('#text-vanity').prop('disabled', false);
		resetEyeColor();
	});
}

function newSearch(){
		// hide elements
		$('.cancel-address').hide(100);
		$('.new-search').hide(100);
		$(".result-container").hide(100);

		// show elements
		$('.create-address').show(100);
		$("#vanity-form .options").show(100);

		$('#text-vanity').prop('disabled', false);
		resetEyeColor();
}
