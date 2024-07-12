using System.Data;
using System;

namespace SignalRChat.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string UserName { get; set; }
         public string? ReceiverUserName { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }
}