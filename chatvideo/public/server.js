$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
  
    // Inicializar las varibles que tomaremos del server.html 
    var $window = $(window); //Usaremos dos ventanas la primera de login y la segunda del chat
    var $usernameInput = $('.usernameInput'); // Entrada del nombre de uusario 
    var $messages = $('.messages'); // Entrada del  area de mensajes
    var $inputMessage = $('.inputMessage'); // Entrada del mensajes a leer
  
    var $loginPage = $('.login.page'); // La página del login
    var $chatPage = $('.chat.page'); // La página de chat 
    var $hostUsername = $('.hostUsername');
    ////////////////////INICIO////////////////////
    var $titleLogin = $('.title');
    ///////////////////  FIN  ///////////////////
  
    // Prompt for setting a username
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
    var hostGuy;
    var isHost = false;
  
    
    var socket = io();

    // Función que agrega el mensaje de cuantos participantes hay en el chat
    function addParticipantsMessage (data) {
      var message = '';
      if (data.numUsers === 1) {
        message += "Hay un participante dentro del chat" ;
      } else {
        message += "Hay" + data.numUsers + " participantes";
      }
      log(message);
    }

    function hostName (data) {
      var message = '';
      if (data === null) {
        message += "En este momento no hay host, esperemos a uno"; 
      } else {
        message += "El host actual es :" + data;
      }
      log(message);
    }
    
    
    // Sets the client's username
    function setUsername () {
        isHost = false;
        username = cleanInput($usernameInput.val());
        // If the username is valid
    
        ////////////////////INICIO////////////////////
        if (username) {
          socket.emit('exists user', username, function (cbValue){
            if(cbValue)
            {
              $loginPage.fadeOut();  //Ocultar el elementos
              $chatPage.show();  //Muestra elementos que estaban ocultos
              $loginPage.off('click');  //Remueve los eventos 
              $currentInput = $inputMessage.focus(); // fijamos el cursor en el inputMessage
    
              // Tell the server your username
              socket.emit('add user', username); //emitimos el evento add user
            }
            else
            {
              $titleLogin.html('el usuario "' + username + '" ya existe');
              $usernameInput.val(null);
              username = null;
            }
          })
        }
      }
    
      // Envia el mensaje 
      function sendMessage () {
        var message = $inputMessage.val(); //El mensaje lo obtendremos de la entrada del html
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) { // si no hay un mensaje vacio y esta conectado del usuario
          $inputMessage.val(''); // cambiamos el valor a vacio
          addChatMessage({ // agregamos al chat el usuario con el mensaje que escribio
            username: username,
            message: message
          });
          // tell server to execute 'new message' and send along one parameter
          socket.emit('new message', message);
        }
      }

      // Log a message
    function log (message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
      }
    
      // Adds the visual chat message to the message list
      function addChatMessage (data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
          options.fade = false;
          $typingMessages.remove();
        }
    
        var $usernameDiv = $('<span class="username"/>')
          .text(data.username)
          .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
          .text(data.message);
    
        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
          .data('username', data.username)
          .addClass(typingClass)
          .append($usernameDiv, $messageBodyDiv);
    
        addMessageElement($messageDiv, options);
      }
    
      // poner que alguien esta escribiendo
      function addChatTyping (data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
      }
    
      // Quitar cuando alguien esta escribiendo
      function removeChatTyping (data) {
        getTypingMessages(data).fadeOut(function () {
          $(this).remove();
        });
      }
      
    
      // Adds a message element to the messages and scrolls to the bottom
      // el - The element to add as a message
      // options.fade - If the element should fade-in (default = true)
      // options.prepend - If the element should prepend
      //   all other messages (default = false)
      function addMessageElement (el, options) {
        var $el = $(el);
    
        // Setup default options
        if (!options) {
          options = {};
        }
        if (typeof options.fade === 'undefined') {
          options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
          options.prepend = false;
        }
    
        // Apply options
        if (options.fade) {
          $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
          $messages.prepend($el);
        } else {
          $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
      }
    
      // Prevents input from having injected markup
      function cleanInput (input) {
        return $('<div/>').text(input).text();
      }
    
      // Updates the typing event
      function updateTyping () {
        if (connected) {
          if (!typing) {
            typing = true;
            socket.emit('typing'); 
          }
          lastTypingTime = (new Date()).getTime();
    
          setTimeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
              socket.emit('stop typing');
              typing = false;
            }
          }, TYPING_TIMER_LENGTH);
        }
      }
    
      // Gets the 'X is typing' messages of a user
      function getTypingMessages (data) {
        return $('.typing.message').filter(function (i) {
          return $(this).data('username') === data.username;
        });
      }
    
      // Gets the color of a username through our hash function
      function getUsernameColor (username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
           hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
      }

    
      // Keyboard events
    
      $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
          $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
          if (username && isHost === false) {
            sendMessage();
            socket.emit('stop typing');
            typing = false;
          } else if (!username && isHost === false) {
            console.log("soy cleint")
            setUsername();
          } 
        }
      });
    
      $inputMessage.on('input', function() {
        updateTyping();
      });

      // Click events
  
    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $currentInput.focus();
      });
    
      // Focus input when clicking on the message input's border
      $inputMessage.click(function () {
        $inputMessage.focus();
      });
    
      // Socket events
    
      // Whenever the server emits 'login', log the login message
      socket.on('login', function (data) {
        connected = true;
        // Display the welcome message
        var message = "Chat";
        log(message, {
          prepend: true
        });
        addParticipantsMessage(data);
      });
    
      // Whenever the server emits 'new message', update the chat body
      socket.on('new message', function (data) {
        addChatMessage(data);
      });
    
      // Whenever the server emits 'user joined', log it in the chat body
      socket.on('user joined', function (data) {
        log(data.username + ' joined');
        addParticipantsMessage(data);
      });
    
      // Whenever the server emits 'user left', log it in the chat body
      socket.on('user left', function (data) {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
      });
    
      // Whenever the server emits 'typing', show the typing message
      socket.on('typing', function (data) {
        addChatTyping(data);
      });
    
      // Whenever the server emits 'stop typing', kill the typing message
      socket.on('stop typing', function (data) {
        removeChatTyping(data);
      });

});