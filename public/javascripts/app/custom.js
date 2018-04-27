$( document ).ready(function() {
	
	// Copy to Clipboard
	$('.clipboard').tooltip({
		title: 'Copied!',
    	delay: 0,
	  	trigger: 'click',
	  	placement: 'right'
	});

	function hideTooltip() {
		setTimeout(function() {
	    	$('.clipboard').tooltip('hide');
	  	}, 700);
	}

	var clipboard = new ClipboardJS('button');

	clipboard.on('success', function(e) {
		hideTooltip();
	});


});

function validateTextVanity(textVanity){
	if(textVanity == ""){
		$("#text-vanity").addClass('error');
		$("#alert-message").show();
		$("#alert-message").text("erro");
		return false;
	}else{
		$("#text-vanity").removeClass('error');
		$("#alert-message").hide();
		return true;
	}
}

function createWallet(){
	var textVanity = $("#text-vanity").val();
	$(".result-address").hide();

	//validate input text
	if(validateTextVanity(textVanity)){
		
		//change buttons
		$('.create-address').hide();
		$('.cancel-address').css("display", "block");
		$('.cancel-address').show();
		$('#text-vanity').prop('disabled', true);

		//ajax call
		$.post("/generateWallet", {
			textVanity: textVanity
		}).done(function(data){
			//result
			$(".public-key span").text(data[0]);
			$(".public-key .clipboard").attr("data-clipboard-text", data[0]);
			$(".private-key span").text(data[1]);
			$(".private-key .clipboard").attr("data-clipboard-text", data[1]);
			$(".attempts span").text(data[2]);
			$(".result-address").fadeIn();

			$('#text-vanity').prop('disabled', false);
			$('.create-address').show();
			$('.cancel-address').hide();
		});
	}
}


function cancelWallet(){
	$.get("/cancelWallet", function(data){
		console.log(data);
	});
}


