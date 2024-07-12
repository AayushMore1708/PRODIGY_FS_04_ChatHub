﻿using System.Threading.Tasks;
using System.Data;
using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SignalRChat.Models;
using SignalRChat.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace SignalRChat.Hubs
{
[Authorize]
	public class ChatHub: Hub
	{
		private readonly ApplicationDbContext _dbContext;

		public ChatHub(ApplicationDbContext dbContext)
		{
			_dbContext = dbContext;
		}

		public async Task SendMessage(string message)
		{
			try
			{
				var chatMessage = new ChatMessage
				{
					UserName = Context.User.Identity.Name,
						Message = message,
						ReceiverUserName = "",
						Timestamp = DateTime.Now
				};

				_dbContext.ChatMessages.Add(chatMessage);
				await _dbContext.SaveChangesAsync();

 await Clients.All.SendAsync("ReceiveMessage", Context.User.Identity.Name, message).ConfigureAwait(false);
  
			}

			catch (Exception ex)
			{
				Console.WriteLine("Error saving message: {ex.Message}");
			}
		}

		public async Task SendPrivateMessage(string receiverUserName, string message)
		{
			try
			{
				if (string.IsNullOrEmpty(receiverUserName))
				{
					throw new ArgumentNullException(nameof(receiverUserName), "Receiver username cannot be null or empty.");
				}

				// Check if the receiver username exists in the database
				var userExists = await _dbContext.ChatMessages.AnyAsync(u => u.UserName == receiverUserName);
				if (!userExists)
				{
					await Clients.Caller.SendAsync("Alert", "Username not found");
                          return;
				}

				var chatMessage = new ChatMessage
				{
					UserName = Context.User.Identity.Name,
						ReceiverUserName = receiverUserName,
						Message = message,
						Timestamp = DateTime.Now
				};

				_dbContext.ChatMessages.Add(chatMessage);
				await _dbContext.SaveChangesAsync();

 await Clients.All.SendAsync("ReceivePrivateMessage", Context.User.Identity.Name, message).ConfigureAwait(false);
   	}

			catch (Exception ex)
			{
				Console.WriteLine($"Error saving private message: {ex.Message}");
			}
		}

		public async Task LoadPreviousMessages()
		{
			try
			{
				var previousMessages = await _dbContext.ChatMessages
					.Where(cm => cm.ReceiverUserName == "")
					.Take(50)
					.ToListAsync();

				await Clients.Caller.SendAsync("LoadPreviousMessages", previousMessages);
			}

			catch (Exception ex)
			{
				Console.WriteLine("Error loading previous messages: {ex.Message}");
			}
		}

		public async Task LoadPrivateMessages()
		{
			try
			{
				var previousMessages = await _dbContext.ChatMessages
					.Where(cm => !string.IsNullOrEmpty(cm.ReceiverUserName))
					.OrderByDescending(cm => cm.Message)
					.Take(50)
					.ToListAsync();

				await Clients.Caller.SendAsync("LoadPrivateMessages", previousMessages);
			}

			catch (Exception ex)
			{
				Console.WriteLine("Error loading private messages: {ex.Message}");
			}
		}
	}
}