
using System.ComponentModel.DataAnnotations;

namespace ToDo.Api.Dtos
{
    public class CreateToDoItemDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [MaxLength(1000)]
        public string? Description { get; set; }
    }
}
