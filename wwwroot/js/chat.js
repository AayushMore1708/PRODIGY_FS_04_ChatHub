"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".loading-indicator").style.display = "block";
    
    connection.on("LoadPreviousMessages", function (messages) {
        document.querySelector(".loading-indicator").style.display = "none";
        
        messages.forEach(function (message) {
            var msg = message.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            var today = new Date(message.timestamp);
            var time = today.getHours() + ":" + today.getMinutes();
            var encodedMsg = "<p><strong>" + message.userName + "</strong> <span class='messageTime'>" + time + "</span></p><p>" + msg + "</p>";
            
            var element = document.createElement("div");
            element.innerHTML = encodedMsg;
            document.getElementById("messages").appendChild(element);
            var messagesContainer = document.getElementById("messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    });
    
    connection.on("LoadPrivateMessages", function (messagesP) {
        document.querySelector(".loading-indicator").style.display = "none";
        
        messagesP.forEach(function (privateMessage) {
            var msg = privateMessage.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            var today = new Date(privateMessage.timestamp);
            var time = today.getHours() + ":" + today.getMinutes();
            var encodedMsg = "<p><strong>" + privateMessage.userName + "</strong> <span class='messageTime'>" + time + "</span></p><p>" + msg + "</p>";
            
            var element = document.createElement("div");
            element.innerHTML = encodedMsg;
            document.getElementById("messagesP").appendChild(element);
            var privateMessagesContainer = document.getElementById("messagesP");
            privateMessagesContainer.scrollTop = privateMessagesContainer.scrollHeight;
        });
    });
    
    document.getElementById("sendButton").addEventListener("click", async function (event) {
        try {
            var message = document.getElementById("messageInput").value;
            
            if (message.trim() !== "" && document.getElementById("Uname") !== null) {
                if (document.getElementById("Uname")) { 
                    var uname = document.getElementById("Uname").value;
                }
                
                await connection.invoke("SendPrivateMessage", uname, message).catch(function (err) {
                    console.error(err.toString());
                });
                
              
                
                document.getElementById("messageInput").value = "";
            } else {
                await connection.invoke("SendMessage", message).catch(function (err) {
                    console.error(err.toString());
                });
                
           
                document.getElementById("messageInput").value = "";
            }
            
            
        } catch (error) {
            console.error("Error occurred: ", error);
        }
    });
    
    connection.on("ReceiveMessage", function (userName, message) {
        var encodedMsg = "<p><strong>" + userName + "</strong> <span class='messageTime'>" + new Date().toLocaleTimeString() + "</span></p><p>" + message + "</p>";
        var element = document.createElement("div");
        element.innerHTML = encodedMsg;
        document.getElementById("messages").appendChild(element);
        var messagesContainer = document.getElementById("messages");
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight; // scroll to bottom
      
    });
    
    connection.on("ReceivePrivateMessage", function (userName, message) {
        var encodedMsg = "<p><strong>" + userName + "</strong> <span class='messageTime'>" + new Date().toLocaleTimeString() + "</span></p><p>" + message + "</p>";
        var element = document.createElement("div");
        element.innerHTML = encodedMsg;
        document.getElementById("messagesP").appendChild(element);
        var messagesContainer = document.getElementById("messagesP");
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight; // scroll to bottom

    });
    connection.on("Alert", function (message) {
        window.alert(message);
    });
    
    connection.start().then(function () {
        console.log("Connection established");
        connection.invoke("LoadPreviousMessages").catch(function (err) {
            console.error("Error loading previous messages:", err);
        });
        connection.invoke("LoadPrivateMessages").catch(function (err) {
            console.error("Error loading private messages:", err);
        });
    }).catch(function (err) {
        console.error("Error establishing connection:", err);
    });
    
    document.getElementById("messageInput").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById("sendButton").click();
        }
        event.preventDefault();
    });
});