// Import only the components we need from Zen
import 'origami-zen/components/IconSet/IconSet';
import 'origami-zen/components/Icon/Icon';
import 'origami-zen/components/Checkbox/Checkbox';
import 'origami-zen/components/Input/Input';
import 'origami-zen/components/Button/Button';

class TodoList {
    constructor(container) {
        // Wrapping container for app
        this.container = document.querySelector(container);
        // UL list for all items
        this.todoList = this.container.querySelector('ul.todo-items');
        const template = document.querySelector('template#todo-item');
        // Template to clone for each item
        this.template = document.importNode(template.content, true);
        // API prefix for fetch()
        this.API = '/api/v1';

        this.setup();
        this.getItems();
    }


    // Sets up adding a new item for the text field when 'Enter' is pressed
    setup() {
        // Listen for enter key on input field to create new item
        this.container.querySelector('.new-todo')
            .addEventListener('keyup', e => {
                if (e.code !== 'Enter') return;
                this.createItem(e.target.value);
                // Reset the text field
                e.target.value = null;
            });

        // Link clear button to removing all completed items
        this.container.querySelector('zen-button')
            .addEventListener('click', this.clearCompleted.bind(this));
    }


    // Retrieve a list of the items, then adds them into the list
    async getItems() {
        // Set loading state
        this.container.classList.add('loading')

        // Get all the todo items from the Resource API
        const res = await fetch(`${this.API}/items`, {
            method: 'get',
            headers: {'content-type': 'application/json'}
        }).then(r => r.json());


        // Set the state
        this.container.classList.remove('loading');
        this.container.classList.add('loaded');

        // Loop over each item and add it to the list
        res.data.forEach(this.addItemToList.bind(this));
    }


    // Adds a new todo item to the list, with event listeners and default values
    async addItemToList(item) {
        // Clone the template
        const clone = this.template.cloneNode({deep: true});
        const li = clone.firstElementChild;

        // Set the ID (used for editing and removing)
        li.id = item.id;
        const input = li.querySelector('zen-input');
        const checkbox = li.querySelector('zen-checkbox');
        const remove = li.querySelector('zen-icon');

        // Set the initial values (completed, text, etc)
        input.value = item.text;
        input.disabled = Boolean(item.completed);
        checkbox.checked = Boolean(item.completed);
        li.classList.toggle('completed', Boolean(item.completed));


        // Setup listeners for text changing, clicking 'complete', and removing
        input.addEventListener('change', (e) => {
            this.updateItem(item.id, {text: e.target.value});
        });
        checkbox.addEventListener('change', (e) => {
            this.checkoffItem(item.id, e.target.checked);
        });
        remove.addEventListener('click', () => this.removeItem(item.id));

        // Finally, add it to the list
        this.todoList.appendChild(li);
    }


    // Creates a new todo item in the API, and adds the result to the list
    async createItem(text) {
        const res = await fetch(`${this.API}/items`, {
            method: 'post',
            body: JSON.stringify({text}),
            headers: {'content-type': 'application/json'}
        }).then(r => r.json());

        this.addItemToList(res.data);
    }


    // Saves an update in the API for a todo item
    async updateItem(id, data) {
        // Update the resource with a PUT request
        const res = await fetch(`${this.API}/items/${id}`, {
            method: 'put',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        }).then(r => r.json());

        return res.data;
    }


    // Toggles an item as completed or not completed, and saves in the API
    async checkoffItem(id, completed) {
        const li = document.getElementById(id);
        li.classList.toggle('completed', completed);
        li.querySelector('zen-input').disabled = completed;

        // Save the updated item
        this.updateItem(id, {completed});
    }


    // Removes an item from the list, and deletes in the API
    async removeItem(id) {
        // Delete the resource with a DELETE request
        const res = await fetch(`${this.API}/items/${id}`, {
            method: 'delete',
            headers: {'content-type': 'application/json'}
        }).then(r => r.json());

        // Remove the item in the API
        document.getElementById(id).remove();
    }


    // Loops over all completed items and removes them
    async clearCompleted() {
        Array.from(this.container.querySelectorAll('li.completed'))
            .map(li => li.id)
            .forEach(this.removeItem.bind(this));
    }
}

window.addEventListener('load', () => new TodoList('.todo'));
