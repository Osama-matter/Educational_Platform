using System;
using System.Text.Json.Serialization;

namespace EducationalPlatform.Application.DTOs.Forum
{
    public class ForumThreadDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        
        [JsonPropertyName("content")]
        public string Content { get => Description; set => Description = value; }

        public Guid UserId { get; set; }

        [JsonPropertyName("authorId")]
        public string AuthorId => UserId.ToString();

        public string UserName { get; set; }

        [JsonPropertyName("authorName")]
        public string AuthorName => !string.IsNullOrEmpty(UserName) ? UserName : "عضو";

        [JsonPropertyName("postsCount")]
        public int PostCount { get; set; }

        [JsonPropertyName("votesCount")]
        public int VoteCount { get; set; }

        public bool IsSubscribed { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateForumThreadDto
    {
        public string Title { get; set; }
        public string? Description { get; set; }

        [JsonPropertyName("content")]
        public string? Content 
        { 
            get => Description; 
            set => Description = value ?? Description; 
        }
    }

    public class UpdateForumThreadDto
    {
        public string Title { get; set; }
        public string? Description { get; set; }

        [JsonPropertyName("content")]
        public string? Content 
        { 
            get => Description; 
            set => Description = value ?? Description; 
        }
    }
}
