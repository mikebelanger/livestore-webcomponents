// Utility for parsing HTML templates and type definitions
import { parseTemplate } from "./utils";
import TodoItemTemplate from '../html/TodoItem.html?raw';  // Import HTML as string
import type { Todo } from "../schema";

// Interface defining the callback functions that parent components must provide
export interface TodoItemOptions {
  onDeleteTodo: (todo: Todo) => void;
  onToggleTodo: (todo: Todo) => void;
}

/**
 * TodoItem Web Component
 * Represents a single todo item with checkbox, label, and delete button
 * Uses the Shadow DOM pattern with HTML templates for encapsulation
 */
export class TodoItem extends HTMLElement {
  // Private field to store the todo data
  #todo: Todo | null

  // Callback functions provided by parent component
  onDeleteTodo: (todo: Todo) => void;
  onToggleTodo: (todo: Todo) => void;

  constructor(options: TodoItemOptions) {
    super()
    this.#todo = null

    // Parse and clone the HTML template, then append to this element
    this.append(parseTemplate(TodoItemTemplate).cloneNode())

    // Store the callback functions from parent component
    this.onDeleteTodo = options.onDeleteTodo;
    this.onToggleTodo = options.onToggleTodo;

    // Set up event listeners for user interactions
    const button = this.querySelector('button');
    if (button) button.addEventListener("click", this.onDelete.bind(this));

    const checkbox = this.querySelector('input[type=checkbox]');
    if (checkbox) checkbox.addEventListener("change", this.onToggle.bind(this));
  }
  // Handle delete button click - calls parent's delete callback
  onDelete() {
    if (this.#todo) {
      this.onDeleteTodo(this.#todo);
    }
  }

  // Handle checkbox toggle - calls parent's toggle callback
  onToggle() {
    if (this.#todo) {
      this.onToggleTodo(this.#todo);
      // toggleTodo(this.#todo)  // Legacy comment - functionality moved to parent
    }
  }
  // Setter for todo data - automatically updates the display when changed
  set todo(t: Todo | null) {
    this.#todo = t
    this.updateTemplate()  // Re-render when data changes
  }

  // Getter for todo data
  get todo(): Todo | null {
    return this.#todo
  }

  // Update the DOM elements to reflect the current todo data
  updateTemplate() {
    // Update the label text with the todo's text content
    const label = this.querySelector('label');
    if (label) label.textContent = this.#todo?.text || "";

    // Update the checkbox state to match the todo's completion status
    const checkbox = this.querySelector('input');
    if (checkbox) checkbox.checked = !!this.#todo?.completed;
  }
}
