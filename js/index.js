// visitorId must be set with cookie
// visitorId = 'superrandomsadfsdsdffID123456790'
let visitorId;

function makeNewId() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
};
	
function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
  }
	
function proceedNewVisitor() {
	visitorId = makeNewId();
	document.cookie= 'userId=' + visitorId;
};

function proceedReturningVisitor() {
	visitorId = getCookie('userId');
}
		
function setUserId() {
	if(getCookie('userId') !== undefined) {
		visitorId = getCookie('userId');
	} else {
		proceedNewVisitor();
	}
}

setUserId();
console.log(visitorId);
		
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbnR5czIwMTFAZ21haWwuY29tIiwiaXNTdXBlckFkbWluIjp0cnVlLCJpYXQiOjE1NTc1ODQyMTcsImV4cCI6MTU1NzYwNTgxNywiYXVkIjoid2ViLWxvZ2luIn0.fD9AI0KpoMSuh8NvxeSBAgw3aJKiFo8YeIFzWpaHB4c'

BOT_URL = 'http://bot.bad.family/api/v1/bots/badtest/mod/channel-web/messages/' + visitorId
var guest = io('http://bot.bad.family/guest?visitorId=' + visitorId);
var admin = io('http://bot.bad.family/admin?visitorId=' + visitorId + '&token=' + token, { forceNew: true });

$(document).ready(function() {
    $(".chat-new-message-div").focus();
    start();
    $('.chat-form').on('submit', function(e) {
		msg = $('#chat-new-message-div').html();
		document.getElementById('chat-new-message-div').innerHTML = '';
        if(msg != '') {
        	send(msg)
        }
        e.preventDefault();
	});
	$('.chat-form').keydown(function(e) {
		if(e.keykode === 13 || e.which === 13) {
		e.preventDefault();
		msg = $('#chat-new-message-div').html();
		document.getElementById('chat-new-message-div').innerHTML = '';
        if(msg != '') {
        	send(msg)
        }
	}
	});
});

switchInformationVisibility = function() {
	document.querySelector('.information').classList.toggle('hidden');
	console.log('switch')
};

showInformation = async function() {
	console.log('show');
	switchInformationVisibility();
	setTimeout(() => document.body.addEventListener('click', hideInformation), 500);
};

hideInformation = async function() {
	console.log('hide');
	switchInformationVisibility();
	setTimeout(() => document.body.removeEventListener('click', hideInformation), 500);
}

document.querySelector(".info").addEventListener('click', showInformation);

admin.on('event', function(data) {
	console.log(data)
})


guest.on('event', function(data) {
	console.log(data)

	$('.typing').text('typing...')
	if(data.data.userId != undefined) {
		if(data.data.message_text != '/start'){
			render_text_msg(data.data.message_text, 'user')
			chat_tobottom();
			$('#chat-new-message-input').val('')
		}
	} else {
		proccess_msg(data)
		chat_tobottom();
		$('.typing').text('chatting since January 2016')
	}


})

function send(msg) {
	$('.chat-qr').css('display', 'none');
    $('.typing').text('typing...')
    $.ajax({
        type: "POST",
        url: BOT_URL,
        data: JSON.stringify({
            type: 'text',
            text: msg
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
    		
        },
        failure: function(err) {
            console.log(err)
        }
    });
}


function proccess_msg(data) {
	if(data.data.message_type == 'text') {
		render_text_msg(data.data.message_text, 'bot')
	}

	if(data.data.message_type == 'custom' && data.data.payload.component == "QuickReplies") {
		render_qr_msg(data)
	}

	if(data.data.message_type == 'custom' && data.data.payload.component == "Dropdown") {
		render_dropdown_msg(data)
	}

	if(data.data.message_type == "carousel") {
		render_carousel_msg(data)
	}

	if(data.data.message_type == "file") {
		render_file_msg(data)
	}
}

function render_qr_msg(msg) {

	// message_type: "custom"
	// component: "QuickReplies"

	// quick_replies: Array
	//		payload: text
	//		title: text

	qr = ''
	for (var key in msg.data.payload.quick_replies) {
		title = msg.data.payload.quick_replies[key].title
		qr += '<button type="button">' + title + '</button>'
	}

	$('.chat-qr').empty()
	$('.chat-qr').append(qr)
	$('.chat-qr').css('display', 'flex');


	$('.chat-qr button').on('click', function(e){
		send(e.target.textContent)
	})

    //$('.chat-messages').append('<div class="message inbox"> <div class="text">'+text+'</div> </div>')
}

function render_dropdown_msg(msg) {

	// message_type: "custom"
	// component: "Dropdown"

	// allowMultiple: bool
	// buttonText: text
	// message: text
	// options: Array
	//		label: text
	//		value: text

	dropdown = ''
	for (var key in msg.data.payload.options) {
		dropdown += '<b>label: "'+msg.data.payload.options[key].label +'" value: "'+ msg.data.payload.options[key].value +'",</b> '
	}

	text  = '<p>type: "'+msg.data.payload.component+'"</p>'
	text += '<p>dropdown: '+dropdown+'</p>'

	
    $('.chat-messages').append('<div class="message inbox"> <div class="text">'+text+'</div> </div>')
}

function render_carousel_msg(msg) {

	// message_type: "carousel"

	// elements: Array
	//		title: text, 
	//		picture: url, 
	//		subtitle: text, 
	//		buttons: Array
	//			type: text
	//			title: text
	//			url: url			
	
    $('.chat-messages').append('<div class="message inbox"> <div class="text">carousel: '+msg+'</div> </div>')
}

function render_file_msg(msg) {

	// check file type! 

	// message_type: "file"

	// type: "file"
	//		url: url

			
	if(msg.data.payload.url.slice(-3) === 'jpg' || msg.data.payload.url.slice(-4) === 'jpeg') {
		$('.chat-messages').append('<div class="message inbox"><div class="text"><img src="'+msg.data.payload.url+'"></div></div>');
		console.log('picture');
	} else {
		$('.chat-messages').append('<div class="message inbox"><a class="link_pdf" href="'+msg.data.payload.url+'"><img class="img_pdf" src="./images/pdf.svg" alt="pdf.file"><br>Скачать</a></div>');
		console.log('pdf');
	}
}

function render_text_msg(msg, sender) {
    if (sender == 'bot') {
        $('.chat-messages').append('<div class="message inbox"> <div class="text">'+msg+'</div> </div>')
    } else {
        $('.chat-messages').append('<div class="message sent">  <div class="text">'+msg+'</div> </div>')
    }
}


function chat_tobottom() {
    document.getElementsByClassName(
        "chat-messages"
    )[0].scrollTop = document.getElementsByClassName("chat-messages")[0].scrollHeight;
}


function start() {
    send('/start')
}