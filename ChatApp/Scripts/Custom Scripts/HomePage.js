let commonBridge;
let currentChatUserName = '';
/*let currentGroupName = '';
let currentGroupNumber = '';*/
let currentChatUserId = '';
let isConversationWindowOpen = false;
let isGroup = false;
let currentChatId;
/*let currentGroupId;*/
var attachmetList = [];

/*********** Fn: Gets all active Chats on the left hand side ***********/
function getAllUserChatAccounts() { 
    $("#custom-table-body1").empty();    
    $.ajax({
        url: window.location.origin + '/Home/GetChatRooms',
        type: 'GET',                
        success: function (res) {
            $("#custom-table-body1").html(res);
        }
    });

    if (currentChatId) {
        $(currentChatId).css('background-color', '#ffc107');
    }
   
}

/*function getAllUserGroupAccounts() {
    $("#custom-group-table-body").empty();
    $.ajax({
        url: window.location.origin + '/Home/GetGroupRooms',
        type: 'GET',
        success: function (res) {
            $("#custom-group-table-body").html(res);          
        }
    });

    if (currentChatId) {
        $(currentChatId).css('background-color', '#ffc107');
    }
   
}*/

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
        data: { receiverId: currentChatUserId, isGroup: isGroup },
        success: function (res) {
            $("#custom-table-body2").html(res);
           /* for (i = 0; i < res.length; i++) {
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
            }*/
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
    attachmetList.forEach(function (item) {

        $.ajax({
            url: window.location.origin + '/Home/SaveImage',
            type: 'POST',
            dataType: 'json',
            data: { base64String: item.filePath.split(",")[1], fileName: item.fileName },
            success: function (res) {
                if (res != "error") {

                    commonBridge.invoke('saveAndSendAttachment', logedInUserName, currentChatUserName, res.FileName, item.filePath, item.size, item.fileType, logedInUserId, currentChatUserId).then(() => {
                        var img = getTypeImage(item.fileType);
                        if (img == "base64string") {
                            $("#custom-table-body2").append(`<tr>
                <td colspan="2" style="display: flex; justify-content: flex-end;">
                   <div class="message-div sent-message">
                            <div class="message-date-main-div">
                                <div class="message-img-attachment-div">
                                   <img class="attachment-img" src="`+ item.filePath + `" width="170" data-name="` + res.FileName + `" />
                                   <a href="`+ item.filePath + `" class="download-img-btn" download="` + res.FileName + `">
                                       <img src="/Content/Images/chat/download-img.svg" width="35" />
                                   </a>
                                </div>
                            </div>
                        </div>
                </td>
            </tr>`);

                        }
                        else {
                            var isFileDownloadable = item.fileType == "pdf" ? 'class="open-pdf"' : 'download="' + item.fileName + '"'
                            $("#custom-table-body2").append(` <div class="message-div sent-message">
                    <div class="message-date-main-div">
                        <div class="message-attachment-div">
                            <a href="`+ res + `" ` + isFileDownloadable + ` >
                                 <img src="`+ img + `" />
                            </a>
                            <div class="attachment-name-size-div">
                                <span>`+ item.fileName + `</span>
                                <span class="size">`+ item.size + `</span>
                            </div>
                        </div>
                    </div>
                </div>`);

                        }
                        $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
                    }).catch((err) => console.log(err));

                }
            }
        });


    });
    attachmetList = [];
    if (message != "") {
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
        }).catch((err) => console.log(err));
    }
    
}

function sendGroupMessage() {
    let message = $('#messageBox').val();
   
    
    commonBridge.invoke('sendGroupMessage', logedInUserName, message, logedInUserId, currentChatUserName, currentChatUserId).then(() => {
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
    commonBridge.invoke('addUserToGroup', logedInUserId, newUserId, currentChatUserName, currentChatUserId).then(() => {
        closeModal('addToGroupModal');
    }).catch((err) => console.log(err));
}
function removeUserFromGroup() {
    var newUserId = $("#userNameForGroup").val();
    commonBridge.invoke('removeUserFromGroup', logedInUserId, currentChatUserName, currentChatUserId).then(() => {
        $('#custom-card-header').addClass('hidden');
        $("#custom-table-body2").empty();
        $('#cardFooter').addClass('hidden');
        $('#img-div').addClass('hidden');
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
                $('#currentConvoUserName')[0].innerText = currentChatUserName;
                $('#groupName').val('');
                $("#loaderClass").addClass('hide');
                closeModal('groupConnectionModal');
                getAllUserChatAccounts();
                getUserChat();
                return;
            }
            getAllUserChatAccounts();
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
    currentChatId = '#' + elem.id;
    var jquerElement = $(elem)
    $('.clickable').css('background-color', '#f44336');
    $(currentChatId).css('background-color', '#ffc107');
    $('#currentConvoUserName')[0].innerText = jquerElement.find('.chat-user-name').text();
    //$('#currentConvoLabel')[0].innerText = 'online';
    jquerElement.find('.unread-count').text('');
    currentChatUserName = jquerElement.find('.chat-user-name').text();
    currentChatUserId = elem.getAttribute('data-id');
    isGroup = jquerElement.data("isgroup");

    
    $('#custom-card-header').removeClass('hidden');
    $('#cardFooter').removeClass('hidden');
    $('#img-div').removeClass('hidden');

    isConversationWindowOpen = true;

    if (isGroup) {
        $('#send-msg-btn').hide();
        $('.group-msg-btn').show();
    }
    else {
        $('#send-msg-btn').show();
        $('.group-msg-btn').hide();
    }
    
    // Load all chat messages - call function for it!
    getUserChat();

}

/*function openGroupCoversation(elem) {
    currentGroupId = '#' + elem.id;
    var jquerElement = $(elem)
    $('.clickable').css('background-color', '#f44336');
    $(currentGroupId).css('background-color', '#ffc107');
    $('#currentConvoUserName')[0].innerText = jquerElement.find('.group-name').text();
    //$('#currentConvoLabel')[0].innerText = 'online';
    jquerElement.find('.unread-count').text('');
    currentChatUserName = jquerElement.find('.group-name').text();
    currentChatId = elem.getAttribute('data-id');

    $('#custom-card-header').removeClass('hidden');
    $('#cardFooter').removeClass('hidden');
    $('#img-div').removeClass('hidden');
    $('#send-msg-btn').hide();
    $('.group-msg-btn').show();
    isConversationWindowOpen = true;

    // Load all chat messages - call function for it!
    getUserGroup();

}*/


function closeModal(modalId) {
    $('#' + modalId).modal('hide');
}

function initiateSignalR() {
    var connection = $.hubConnection();
    connection.logging = true;
    connection.connectionSlow(function () {
        console.log('We are currently experiencing difficulties with the connection.');
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

        if (isConversationWindowOpen && currentChatUserName == groupName && groupId == currentChatUserId) {
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

    });

    commonBridge.on('attachmentReceived', (senderUserName, receiverUserName, fileName, baseString, size, type, senderId, receiverId) => {
        // We sent the message to server and received the response here.

        if (logedInUserName == receiverUserName) {            
            if (isConversationWindowOpen) {
                $("#custom-table-body2").append(
                    `<tr>
                        <td colspan="2" style="display: flex; justify-content: flex-start;">
                            <div class="message-div sent-message">
                            <div class="message-date-main-div">
                                <div class="message-img-attachment-div">
                                   <img class="attachment-img" src="`+ baseString + `" width="170" data-name="` + fileName + `" />
                                   <a href="`+ baseString + `" class="download-img-btn" download="` + fileName + `">
                                       <img src="/Content/Images/chat/download-img.svg" width="35" />
                                   </a>
                                </div>
                            </div>
                        </div>
                        </td>
                    </tr>`
                );
                $('#message-div').scrollTop($('#message-div')[0].scrollHeight);
            }
            getAllUserChatAccounts();
        }
    });

    commonBridge.on('groupChangeMethod', () => {        
        getAllUserChatAccounts();
    });

    connection.start().done().fail(function (error) {
        console.log('Invocation of start failed. Error:' + error)
    }).catch(err => console.error(err.toString())).then(function () { });
}

    $("#uploadBtn").change(function () {
        var files = document.getElementById('uploadBtn').files;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                getBase64(files[i]);
            }
        }
    });
function getTypeImage(name) {
    var img = "";
    if (name == "pdf") {
        img = "/Content/Images/chat/file-pdf-solid.svg";
    }
    else if (name == "docx" || name == "doc") {
        img = "/Content/Images/chat/file-word-solid.svg";
    }
    else if (name == "pptx" || name == "ppt") {
        img = "/Content/Images/chat/file-powerpoint-solid.svg";
    }
    else if (name == "xlsx" || name == "csv" || name == "xls") {
        img = "/Content/Images/chat/file-excel-solid.svg";
    }
    else if (name == "png" || name == "PNG" || name == "JPEG" || name == "jpeg" || name == "jpg" || name == "JPG") {
        img = "base64string";
    }
    else {
        img = "/Content/Images/chat/file-solid.svg";
    }
    return img;
}
function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}
function getExcatSize(_size) {
    var fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),
        i = 0; while (_size > 900) { _size /= 1024; i++; }
    return (Math.round(Math.round(_size * 100) / 100)) + ' ' + fSExt[i];
}
function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        let attachment = {
            id: attachmetList.length + 1,
            fileType: getExtension(file.name),
            filePath: reader.result,
            fileName: file.name,
            size: getExcatSize(file.size)
        }

        attachmetList.push(attachment);
        console.log(attachmetList);
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}