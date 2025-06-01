// Utility for parsing HTML templates and importing dependencies
import TodoContainerTemplate from '../html/TodoContainer.html?raw';  // Import HTML template as string
import type { Todo } from '../schema';
import { TodoItem, type TodoItemOptions } from './TodoItem';
import { parseTemplate } from './utils';

// Interface defining the callback functions that configure the TodoList behavior
export interface TodoListOptions extends TodoItemOptions {
  onSubmit: (e: Event) => void;   // Called when form is submitted (new todo)
  onInput: (e: Event) => void;    // Called when input field value changes
}

/**
 * TodoList Web Component
 * A container component that manages a list of todos with form input
 * Uses a configuration pattern where behavior is injected via callbacks
 */
export class TodoList extends HTMLElement {
  constructor() {
    super()
    // Parse and append the HTML template to this element
    this.appendChild(parseTemplate(TodoContainerTemplate).cloneNode())
  }

  // Array of todo items to display
  todos: ReadonlyArray<Todo> = []

  // Default no-op callback functions - these are replaced by configure()
  onInput(_e: Event) { };         // Input field change handler
  onSubmit(_e: Event) { };        // Form submission handler
  onDeleteTodo(_t: Todo) { };     // Todo deletion handler
  onToggleTodo(_t: Todo) { };     // Todo toggle handler

  /**
   * Configure the component with callback functions
   * This pattern allows the parent to inject behavior without subclassing
   */
  configure(options: TodoListOptions) {
    const { onSubmit, onInput, onDeleteTodo, onToggleTodo } = options;
    
    // Replace the default no-op functions with the provided callbacks
    this.onSubmit = onSubmit;
    this.onInput = onInput;
    this.onDeleteTodo = onDeleteTodo;
    this.onToggleTodo = onToggleTodo;
    
    // Set up event listeners for form interactions
    const input = this.querySelector('input')
    input?.addEventListener('input', this.onInput.bind(this));

    const form = this.querySelector('form')
    form?.addEventListener('submit', this.onSubmit.bind(this));
    
    // Initial render after configuration
    this.render();
  }
  /**
   * Re-render the list of todo items
   * Creates TodoItem components for each todo and appends them to the container
   */
  render() {
    // TODO: don't clear, just update existing or add/remove for better performance
    const todoContainer = this.querySelector("#todo-container");
    if (todoContainer) {
      // Clear existing todo items
      todoContainer.innerHTML = '';
      
      // Create and append a TodoItem component for each todo
      for (const todo of this.todos) {
        // Pass our callback functions down to each TodoItem
        const todoEl = new TodoItem({ onDeleteTodo: this.onDeleteTodo, onToggleTodo: this.onToggleTodo });
        todoEl.todo = todo;  // Set the todo data
        todoContainer.append(todoEl)
      }
    }
  }
  /**
   * Web Component lifecycle method - called when element is added to DOM
   * Performs initial render of the component
   */
  connectedCallback() {
    this.render();
  }
}
//
