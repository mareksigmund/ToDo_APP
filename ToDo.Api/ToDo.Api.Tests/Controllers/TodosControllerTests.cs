using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ToDo.Api.Controllers;
using ToDo.Api.Data;
using ToDo.Api.Dtos;
using ToDo.Api.Models;

namespace ToDo.Api.Tests.Controllers
{
    public class TodosControllerTests
    {
        private AppDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
               .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
               .Options;

            return new AppDbContext(options);
        }

        private TodosController CreateController(AppDbContext context)
        {
            return new TodosController(context);
        }

        [Fact]
        public async Task Create_ShouldReturnCreated_AndPersistTodo()
        {
            // Arrange
            var context = CreateInMemoryDbContext();
            var controller = CreateController(context);

            var createDto = new CreateToDoItemDto
            {
                Title = "Test task",
                Description = "Test description"
            };

            // Act
            var result = await controller.Create(createDto);

            // Assert: typ odpowiedzi
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnedDto = Assert.IsType<ToDoItemDto>(createdResult.Value);

            Assert.Equal("Test task", returnedDto.Title);
            Assert.False(returnedDto.IsCompleted);

            // Assert: dane w bazie
            var todosInDb = await context.ToDoItems.ToListAsync();
            Assert.Single(todosInDb);

            var todo = todosInDb.First();
            Assert.Equal("Test task", todo.Title);
            Assert.False(todo.IsCompleted);
        }

        [Fact]
        public async Task ToggleStatus_ShouldFlipIsCompleted_WhenTodoExists()
        {
            // Arrange
            var context = CreateInMemoryDbContext();

            var existing = new ToDoItem
            {
                Id = Guid.NewGuid(),
                Title = "Toggle test",
                Description = null,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };

            context.ToDoItems.Add(existing);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Act
            var result = await controller.ToggleStatus(existing.Id);

            // Assert: NoContent
            Assert.IsType<NoContentResult>(result);

            // Sprawdź w bazie po pierwszym toggle
            var updated = await context.ToDoItems.FindAsync(existing.Id);
            Assert.NotNull(updated);
            Assert.True(updated!.IsCompleted);

            // Drugi toggle - wraca na false
            await controller.ToggleStatus(existing.Id);
            var updatedAgain = await context.ToDoItems.FindAsync(existing.Id);
            Assert.False(updatedAgain!.IsCompleted);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenTodoDoesNotExist()
        {
            // Arrange
            var context = CreateInMemoryDbContext();
            var controller = CreateController(context);

            // Act
            var result = await controller.GetById(Guid.NewGuid());

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
