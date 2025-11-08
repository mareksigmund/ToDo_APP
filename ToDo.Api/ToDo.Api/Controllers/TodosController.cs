using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDo.Api.Data;
using ToDo.Api.Dtos;
using ToDo.Api.Models;

namespace ToDo.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TodosController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/todos
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var todos = await _context.ToDoItems
                .AsNoTracking()
                .Select(t => new ToDoItemDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    IsCompleted = t.IsCompleted

                }).ToListAsync();
            return Ok(todos);
        }

        //GET /api/todos/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var todo = await _context.ToDoItems
                .AsNoTracking()
                .Where(t => t.Id == id)
                .Select(t => new ToDoItemDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    IsCompleted = t.IsCompleted
                }).FirstOrDefaultAsync();
            if (todo == null)
            {
                return NotFound();
            }
            return Ok(todo);
        }


        //POST /api/todos
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateToDoItemDto createDto)
        {

            var todoItem = new ToDoItem
            {
                Title = createDto.Title,
                Description = createDto.Description,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };
            try
            {
                _context.ToDoItems.Add(todoItem);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the task.");
            }


            var todoDto = new ToDoItemDto
            {
                Id = todoItem.Id,
                Title = todoItem.Title,
                Description = todoItem.Description,
                CreatedAt = todoItem.CreatedAt,
                IsCompleted = todoItem.IsCompleted
            };

            return CreatedAtAction(nameof(GetById), new { id = todoItem.Id }, todoDto);


        }

        //PUT /api/todos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] EditToDoItemDto editDto)
        {
            var todo = await _context.ToDoItems.FindAsync(id);

            if (todo == null)
            {
                return NotFound();
            }

            todo.Title = editDto.Title;
            todo.Description = editDto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the task.");
            }
            return NoContent();
        }

        // PUT /api/todos/{id}/toggle
        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var todo = await _context.ToDoItems.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }
            todo.IsCompleted = !todo.IsCompleted;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while toggling the task status.");
            }
            return NoContent();
        }

        //DELETE /api/todos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var todo = await _context.ToDoItems.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }
            _context.ToDoItems.Remove(todo);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the task.");
            }
            return NoContent();
        }


    }
}
