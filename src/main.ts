/* eslint-disable prefer-arrow/prefer-arrow-functions */
// import 'todomvc-app-css/index.css'
// import './index.css'

import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { createStorePromise, queryDb } from '@livestore/livestore'

// Worker for background database operations and our schema definitions
import LiveStoreWorker from './livestore.worker?worker'
import { events, schema, tables, type Todo } from './schema.js';

// Custom web components for the todo application
import { TodoItem } from './webcomponents/TodoItem.js';
import { TodoList } from './webcomponents/TodoList.js';

// Create a persisted adapter using OPFS (Origin Private File System) for local storage
// This enables offline functionality with SQLite database in the browser
const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,          // Background worker for database operations
  sharedWorker: LiveStoreSharedWorker, // Shared worker for cross-tab synchronization
})

// Initialize the reactive data store with our schema and persistence
const store = await createStorePromise({ schema, adapter, storeId: 'todomvc-custom-elements' })

// Create reactive queries that automatically update when data changes
const appState$ = queryDb(tables.uiState.get())                    // UI state (like input text)
const todos$ = queryDb(tables.todos.where({ deletedAt: null }))    // Active todos (not deleted)

// Action functions that commit events to the store to update data
// These functions encapsulate business logic and ensure data consistency

// Update the text in the new todo input field
const updatedNewTodoText = (text: string) => store.commit(events.uiStateSet({ newTodoText: text }))

// Create a new todo item and clear the input field
const todoCreated = (text: string) =>
  store.commit(events.todoCreated({ id: crypto.randomUUID(), text }), events.uiStateSet({ newTodoText: '' }))

// Toggle the completion status of a todo item
const toggleTodo = (todo: Todo) => {
  if (todo.completed) {
    store.commit(events.todoUncompleted({ id: todo.id }))
  } else {
    store.commit(events.todoCompleted({ id: todo.id }))
  }
}

// Soft delete a todo by setting deletedAt timestamp (preserves data for potential recovery)
const todoDeleted = (todo: Todo) => store.commit(events.todoDeleted({ id: todo.id, deletedAt: new Date() }))

// Register our custom web components with the browser's CustomElementRegistry
// This allows us to use <todo-item> and <todo-list> as HTML elements
customElements.define('todo-item', TodoItem);
customElements.define('todo-list', TodoList);

// Get the todo-list element from the DOM and set up the application
const todoElement = document.getElementById('todo-list') as TodoList;

if (todoElement) {
  const input = todoElement.querySelector('input') as HTMLInputElement;

  // Subscribe to todos data changes and update the UI when todos change
  // NOTE: can we get an AsyncIterator for newValues as well?
  // TODO unsubscribe when component is destroyed
  store.subscribe(todos$, {
    onUpdate: (newValue) => {
      todoElement.todos = newValue    // Update the component's data
      todoElement.render()            // Re-render the todo list
    },
  })

  // Subscribe to app state changes and sync the input field
  // TODO unsubscribe when component is destroyed
  store.subscribe(appState$, {
    onUpdate: (newValue) => {
      if (input) {
        input.value = newValue.newTodoText;  // Keep input field in sync with state
      }
    },
  })

  // Configure the todo list component with event handlers
  todoElement.configure({
    // Handle input changes - update the app state as user types
    onInput: (e: Event) => {
      const input = e.target as HTMLInputElement
      updatedNewTodoText(input.value)
    },

    // Handle form submission - create new todo and prevent page reload
    onSubmit: (e: Event) => {
      e.preventDefault()
      const input = todoElement.querySelector('input') as HTMLInputElement;
      if (input) todoCreated(input.value);
    },

    // Handle todo completion toggle
    onToggleTodo: (todo: Todo) => {
      toggleTodo(todo);
    },

    // Handle todo deletion
    onDeleteTodo: (todo: Todo) => {
      todoDeleted(todo);
    }
  })
}
