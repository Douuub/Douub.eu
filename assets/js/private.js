$(document).ready(function(){
    var lastMessage = ""; // Variable pour stocker le dernier message reçu

    // Fonction pour faire défiler les messages vers le bas
    function scrollToBottom() {
        var messageList = $('#message-list');
        messageList.scrollTop(messageList.prop('scrollHeight'));
    }

    // Gère l'envoi des messages via AJAX
    $('#message-form').on('submit', function(e){
        e.preventDefault();
        var messageContent = $('#message_content').val().trim();

        // Remplace les multiples retours à la ligne par un seul
        messageContent = messageContent.replace(/(\r\n|\r|\n){2,}/g, '\n');

        if (messageContent.length === 0) {
            alert('Le message ne peut pas être vide.');
            return;
        }

        $.ajax({
            url: 'post_private_message.php', 
            method: 'POST',
            data: { 
                message_content: messageContent,
                other_user_id: $('#other_user_id').val() // Assurez-vous que cet ID est passé en tant qu'input caché ou variable de session
            },
            dataType: 'json',
            success: function(response){
                console.log('Success:', response);
                if(response.status === 'success'){
                    $('#message_content').val('');
                    fetchMessages(true); // Forcer le rafraîchissement après l'envoi
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr, status, error){
                console.error('Erreur AJAX: ' + status + ' - ' + error);
                console.log(xhr.responseText);
            }
        });
    });

    // Fonction pour charger les messages
    function fetchMessages(forceScroll = false){
        $.ajax({
            url: 'fetch_private_messages.php', // Assurez-vous que ce fichier est configuré pour retourner les messages privés
            method: 'GET',
            data: { other_user_id: $('#other_user_id').val() }, // Passer l'ID de l'autre utilisateur
            success: function(data){
                if (lastMessage !== data || forceScroll) {
                    $('#message-list').html('');
                    data.forEach(function(message){
                        $('#message-list').append('<li>' + message.username + ': ' + message.message_content + '</li>');
                    });
                    scrollToBottom();
                }
                lastMessage = data; // Mise à jour du dernier message reçu
            },
            error: function(xhr, status, error){
                console.error('Erreur AJAX: ' + status + ' - ' + error);
            }
        });
    }

    // Actualise les messages toutes les secondes
    setInterval(fetchMessages, 2000);

    // Empêche le retour à la ligne dans le textarea et valide le contenu
    $('#message_content').on('keypress', function(e){
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            var messageContent = $(this).val().trim();

            messageContent = messageContent.replace(/(\r\n|\r|\n){2,}/g, '\n');
            
            if (messageContent.length === 0) {
                alert('Le message ne peut pas être vide.');
            } else {
                $('#message-form').submit();
            }
        }
    });
});