let commonBridge;
let currentChatUserName = '';
let currentGroupName = '';
let currentGroupNumber = '';
let currentChatUserId = '';
let isConversationWindowOpen = false;

let currentChatId;
let currentGroupId;

/*********** Fn: Gets all active Chats on the left hand side ***********/
function getAllUserChatAccounts() { 
    $("#custom-table-body1").empty();    
    $.ajax({
        url: window.location.origin + '/Home/GetChatRooms',
        type: 'GET',
        dataType: 'json',        
        success: function (res) {
            for (i = 0; i < res.length; i++) {
                $("#custom-table-body1").append(`
                <tr id="${'clickable-row-' + i}" class="clickable" onclick="openCoversation(this)" data-id=${res[i].UserId}>
                    <td class="custom-row1">
                        <div class="card-body dflex">
                            <div class="img-circle fake-img">
                                <img src="/assets/chat-avatar.png" class="image" alt="chat-avatar" />
                            </div>
                            <div class="dflexcol card-details">
                                <h3 id="${'user' + i}" class="custom-margin-block custom-header">${res[i].UserName}</h3>
                                <label id="${'label' + i}" class="custom-label">${''}</label>
                            </div>
                        </div>
                    </td>
                </tr>`);
            }
        }
    });

    

    if (currentChatId) {
        $(currentChatId).css('background-color', '#ffc107');
    }
   
}

function getAllUserGroupAccounts() {
    $("#custom-group-table-body").empty();
    $.ajax({
        url: window.location.origin + '/Home/GetGroupRooms',
        type: 'GET',
        dataType: 'json',        
        success: function (res) {
            for (i = 0; i < res.length; i++) {
                $("#custom-group-table-body").append(`
                <tr id="${'clickable-group-row-' + i}" class="clickable" onclick="openGroupCoversation(this)" data-id=${res[i].GroupId}>
                    <td class="custom-row1">
                        <div class="card-body dflex">
                            <div class="img-circle fake-img">
                                <img src="/assets/chat-avatar.png" class="image" alt="chat-avatar" />
                            </div>
                            <div class="dflexcol card-details">
                                <h3 id="${'user' + i}" class="custom-margin-block custom-header">${res[i].GroupName}</h3>
                                <label id="${'label' + i}" class="custom-label">${''}</label>
                            </div>
                        </div>
                    </td>
                </tr>`);
            }
        }
    });

    

    if (currentChatId) {
        $(currentChatId).css('background-color', '#ffc107');
    }
   
}

/*********** Fn: Gets the User Conversation Window's header ***********/
function getUserConversationWindow() {
    $('#custom-card-header').empty().append(`
        <div class="card-content dflex" style="padding: 5px 7px; border-bottom: 1px solid grey">
            <div class="img-circle fake-img" style="flex: 3%;"></div>
            <div class="dflexcol card-details" style="flex: 90%;">
                <h3 id="currentConvoUserName" class="custom-margin-block"></h3>
                <label id="currentConvoLabel"></label>
            </div>
        </div>
    `);
}

function getUserChat() {   

    $.ajax({
        url: window.location.origin + '/Home/GetChatMessages',
        type: 'GET',
        dataType: 'json',
        data: { receiverId: currentChatUserId},
        success: function (res) {
            $("#custom-table-body2").empty();
            for (i = 0; i < res.length; i++) {
                if (res[i].SenderId == logedInUserId) {
                    $("#custom-table-body2").append(
                        `
                    <tr>
                        <td colspan="2" style="display: flex; justify-content: flex-end;">
                            <div class="custom-card-body">
                                <span class="message-text">${res[i].TextMessage}</span>
                            </div>
                        </td>
                    </tr>
                `
                    );
                }
                else {
                    $("#custom-table-body2").append(
                        `
                    <tr>
                        <td colspan="2" style="display: flex; justify-content: flex-start;">
                            <div class="custom-card-body">
                                <span class="message-text">${res[i].TextMessage}</span>       
                            </div>
                        </td>
                    </tr>
                `
                    );
                }
            }
            $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
        }
    });

    
}


function getUserGroup() {

    $.ajax({
        url: window.location.origin + '/Home/GetGroupMessages',
        type: 'GET',
        dataType: 'json',
        data: { groupId: currentGroupNumber },
        success: function (res) {
            $("#custom-table-body2").empty();
            for (i = 0; i < res.length; i++) {
                if (res[i].SenderId == logedInUserId) {
                    $("#custom-table-body2").append(
                        `
                    <tr>
                        <td colspan="2" style="display: flex; justify-content: flex-end;">
                            <div class="custom-card-body">
                                <span class="message-text">${res[i].TextMessage}</span>
                            </div>
                        </td>
                    </tr>
                `
                    );
                }
                else {
                    $("#custom-table-body2").append(
                        `
                    <tr>
                        <td colspan="2" style="display: flex; justify-content: flex-start;">
                            <div class="custom-card-body">
                                <span class="message-text">${res[i].TextMessage}</span>       
                            </div>
                        </td>
                    </tr>
                `
                    );
                }
            }
            $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
        }
    });


}


function openModal() {
    $("#modal-exhibit").load("RegisterLoginModal");
}

/*********** Fn: Establish Connection on Login ***********/
function establishConnection() {    
    getToken();
}

function validator() {
    let userName = $('#userName').val();
    let password = $('#password').val();
    if ((userName && userName.trim().length > 0) && (password && password.trim().length > 0)) {
        return true;
    }
    else {
        return false;
    }
}

function getToken() {
    $("#loaderClass").removeClass('hide');
    let _data = JSON.stringify({
        'id': $('#logedInName').val(),
    });
    $.ajax({
        url: window.location.origin + '/Home/Login',
        headers: {
            'content-type': 'application/json; charset=utf8'
        },
        method: 'POST',
        data: _data,
        success: function (jqXHR) {
           
        },
        error: function (jqXHR) {
            alert(JSON.parse(jqXHR.responseText).error_description);
            $("#loaderClass").addClass('hide');
        },
    });
}

function addEventListeners() {
    document.getElementById('messageBox').addEventListener('keyup', function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode == 13 && !event.shiftKey) {
            // Cancel the default action, if needed
            event.preventDefault();

            sendMessage();
        }
    });

    document.getElementById('connectToUserName').addEventListener('keyup', function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode == 13) {
            connectUser();
        }
    });
}

function connectToUser(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode == 13) {
        connectUser();
    }
}

function sendMessage() {
    let message = $('#messageBox').val();

    
    commonBridge.invoke('sendMessageTo', logedInUserName, currentChatUserName, message, logedInUserId, currentChatUserId).then(() => {
        $('#messageBox').val('');
        $("#custom-table-body2").append(
            ` <tr>
                <td colspan="2" style="display: flex; justify-content: flex-end;">
                    <div class="custom-card-body">
                        <span class="message-text">${message}</span>
                    </div>
                </td>
            </tr>`
        );
        $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
    }).catch( (err) => console.log(err));
}

function sendGroupMessage() {
    let message = $('#messageBox').val();
   
    
    commonBridge.invoke('sendGroupMessage', logedInUserName, message, logedInUserId, currentGroupName, currentGroupNumber).then(() => {
        $('#messageBox').val('');
        $("#custom-table-body2").append(
            ` <tr>
                <td colspan="2" style="display: flex; justify-content: flex-end;">
                    <div class="custom-card-body">
                        <span class="message-text">${message}</span>
                    </div>
                </td>
            </tr>`
        );
        $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
    }).catch( (err) => console.log(err));
}

function addUserToGroup() {
    var newUserId = $("#userNameForGroup").val();
    commonBridge.invoke('addUserToGroup', logedInUserId, newUserId, currentGroupName, currentGroupNumber).then(() => {
        closeModal('addToGroupModal');
    }).catch((err) => console.log(err));
}
function removeUserFromGroup() {
    var newUserId = $("#userNameForGroup").val();
    commonBridge.invoke('removeUserFromGroup', logedInUserId, currentGroupName, currentGroupNumber).then(() => {
    }).catch((err) => console.log(err));
}

/*********** Fn: Connect to New User Chat ***********/
function connectUser() {
    if (!($('#connectToUserName').val() && $('#connectToUserName').val().trim().length > 0)) {
        alert("Please fill all the required fields");
        return;
    }   
    $("#loaderClass").removeClass('hide');
    $.ajax({
        url: window.location.origin + '/home/startNewChat',
        method: 'POST',
        data: {
            id: $('#connectToUserName').val()
        },
        success: function (res) {           
            if (res) {
                currentChatUserName = $("#connectToUserName option:selected").text();
                currentChatUserId = $('#connectToUserName').val();
                $('#currentConvoUserName')[0].innerText = currentChatUserName;
                //$('#currentConvoLabel')[0].innerText = 'online';
                $('#connectToUserName').val(''); 
                $("#loaderClass").addClass('hide');
                closeModal('chatConnectionModal');
                getUserChat();
                return;
            }
            getAllUserChatAccounts();
            $('#connectToUserName').val('')
            closeModal('chatConnectionModal');
            $("#loaderClass").addClass('hide');
        },
        error: function (jqXHR) {
            console.error(JSON.parse(jqXHR));
            $('#connectToUserName').val('');
            $("#loaderClass").addClass('hide');
        }
    })
}

function addGroup() {
    if (!($('#groupName').val() && $('#groupName').val().trim().length > 0)) {
        alert("Please fill all the required fields");
        return;
    }
    $("#loaderClass").removeClass('hide');
    $.ajax({
        url: window.location.origin + '/home/AddGroup',
        method: 'POST',
        data: {
            groupName: $('#groupName').val()
        },
        success: function (res) {
            if (res) {
                currentChatUserName = $("#connectToUserName option:selected").text();
                currentChatUserId = $('#connectToUserName').val();
                $('#currentConvoUserName')[0].innerText = currentGroupName;
                $('#groupName').val('');
                $("#loaderClass").addClass('hide');
                closeModal('groupConnectionModal');
                getAllUserGroupAccounts();
                getUserGroup();
                return;
            }
            getAllUserGroupAccounts();
            $('#groupName').val('')
            closeModal('groupConnectionModal');
            $("#loaderClass").addClass('hide');
        },
        error: function (jqXHR) {
            console.error(JSON.parse(jqXHR));
            $('#connectToUserName').val('');
            $("#loaderClass").addClass('hide');
        }
    })
}

function startNewChat() {
    $("#chatConnectionModal").modal('show');
}
function startNewGroup() {
    $("#groupConnectionModal").modal('show');
}
function openAddGroupModel() {
    $("#addToGroupModal").modal('show');
}

function openCoversation(elem) {
    currentChatId = '#'+elem.id;
    $('.clickable').css('background-color', '#f44336');
    $(currentChatId).css('background-color', '#ffc107');
    $('#currentConvoUserName')[0].innerText = elem.children[0].children[0].children[1].children[0].innerText;
    //$('#currentConvoLabel')[0].innerText = 'online';

    currentChatUserName = elem.children[0].children[0].children[1].children[0].innerText;
    currentChatUserId = elem.getAttribute('data-id');

    $('#custom-card-header').removeClass('hidden');
    $('#cardFooter').removeClass('hidden');
    $('#img-div').removeClass('hidden');

    isConversationWindowOpen = true;
    $('#send-msg-btn').show();
    $('.group-msg-btn').hide();
    // Load all chat messages - call function for it!
    getUserChat();

}

function openGroupCoversation(elem) {
    currentGroupId = '#'+elem.id;
    $('.clickable').css('background-color', '#f44336');
    $(currentGroupId).css('background-color', '#ffc107');
    $('#currentConvoUserName')[0].innerText = elem.children[0].children[0].children[1].children[0].innerText;
    //$('#currentConvoLabel')[0].innerText = 'online';

    currentGroupName = elem.children[0].children[0].children[1].children[0].innerText;
    currentGroupNumber = elem.getAttribute('data-id');

    $('#custom-card-header').removeClass('hidden');
    $('#cardFooter').removeClass('hidden');
    $('#img-div').removeClass('hidden');
    $('#send-msg-btn').hide();
    $('.group-msg-btn').show();
    isConversationWindowOpen = true;

    // Load all chat messages - call function for it!
    getUserGroup();

}


function closeModal(modalId) {
    $('#' + modalId).modal('hide');
}

function initiateSignalR() {
    var connection = $.hubConnection();
    connection.logging = true;
    connection.connectionSlow(function () {
        console.log('We are currently experiencing difficulties with the connection.')
    });
    connection.disconnected(function () {
        setTimeout(function () {
            connection.start();
        }, 5000); // Restart connection after 5 seconds.
    });
    commonBridge = connection.createHubProxy('commonBridge');

    commonBridge.on('messageReceived', (senderUserName, receiverUserName, message,senderId, receiverId) => {
        // We sent the message to server and received the response here.

        if (logedInUserName == receiverUserName) {
            // Create list of Users on left panel

           /* $.ajax({
                url: window.location.origin + '/home/startNewChat',
                method: 'POST',
                data: {
                    id: senderId
                },
                success: function (jqXHR) {                                       
                },
                
            })*/

            
            if (isConversationWindowOpen) {                
                $("#custom-table-body2").append(
                    `<tr>
                        <td colspan="2" style="display: flex; justify-content: flex-start;">
                            <div class="custom-card-body">
                                <span class="message-text">${message}</span>       
                            </div>
                        </td>
                    </tr>`
                );
                $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
            }
            getAllUserChatAccounts();
        }
    });
    commonBridge.on('groupMessageReceived', (senderUserName, message, senderId, groupName, groupId) => {
        // We sent the message to server and received the response here.

        if (isConversationWindowOpen && currentGroupName == groupName) {
            $("#custom-table-body2").append(
                `<tr>
                        <td colspan="2" style="display: flex; justify-content: flex-start;">
                            <div class="custom-card-body">
                                <span class="message-text">${message}</span>       
                            </div>
                        </td>
                    </tr>`
            );
            $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
        }
        getAllUserGroupAccounts();

    });

    commonBridge.on('groupChangeMethod', () => {        
        getAllUserGroupAccounts();
    });

    connection.start().done().fail(function (error) {
        console.log('Invocation of start failed. Error:' + error)
    }).catch(err => console.error(err.toString())).then(function () { });
}
