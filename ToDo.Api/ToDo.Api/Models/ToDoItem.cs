using System.ComponentModel.DataAnnotations;

namespace ToDo.Api.Models
{
    public class ToDoItem
    {
        public Guid Id { get; set; }
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [MaxLength(1000)]
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsCompleted { get; set; }
    }
}
