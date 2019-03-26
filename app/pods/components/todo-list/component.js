import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';

export default class TodoListComponent extends Component {
  @service store;

  title = 'Todo List';
  @tracked todos = [];
  @tracked isLoading = false;
  @tracked selectedFilter = 'ALL';

  @computed('todos.@each.isCompleted')
  get filteredTodos() {
    switch(this.selectedFilter) {
      case 'ACTIVE':
        return this.todos.filterBy('isCompleted', false);
      case 'COMPLETED':
        return this.todos.filterBy('isCompleted', true);
      default:
        return this.todos;
    }
  }

  @computed('todos.@each.isCompleted')
  get numCompleted() {
    return this.todos.filterBy('isCompleted', true).length;
  }

  @computed('todos.@each.isCompleted')
  get numActive() {
    return this.todos.filterBy('isCompleted', false).length;
  }

  constructor(owner, args) {
    super(owner, args);
    this.loadTodos();
  }

  async loadTodos() {
    try {
      this.isLoading = true;
      const todos = await this.store.findAll('todo', {reload: true});
      this.todos = todos.toArray();
      this.isLoading = false;
    } catch(error) {
      this.todos = [];
      this.isLoading = false;
    }
  }

  @action
  async addTodo(description) {
    const todo = await this.store.createRecord('todo', {
      description,
      isCompleted: false,
      dateCreated: new Date()
    });

    this.todos.pushObject(todo);
    return todo.save();
  }

  @action
  removeTodo(todo) {
    this.todos.removeObject(todo);
    return todo.destroyRecord();
  }

  @action
  toggleTodo(todo, isCompleted) {
    todo.set('isCompleted', isCompleted);
    return todo.save();
  }

  @action
  completeAll() {
    this.todos.filterBy('isCompleted', false).forEach(todo => {
      todo.set('isCompleted', true);
      todo.save();
    });
  }

  @action
  clearCompleted() {
    this.todos.filterBy('isCompleted', true).forEach(todo => {
      this.todos.removeObject(todo);
      todo.destroyRecord();
    });
  }
}
