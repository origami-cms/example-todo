import 'origami-zen/components/IconSet/IconSet';
import 'origami-zen/components/Icon/Icon';
import 'origami-zen/components/Checkbox/Checkbox';
import 'origami-zen/components/Input/Input';
import 'origami-zen/components/Button/Button';

class TodoList {
    constructor(container) {
        this.container = document.querySelector(container);
        this.todoList = this.container.querySelector('ul.todo-items');
        const template = document.querySelector('template#todo-item');
        this.template = document.importNode(template.content, true);
        this.API = '/api/v1';

        this.setup();
        this.getItems();
    }


    // Sets up adding a new item for the text field when Enter is pressed
    setup() {
        this.container.querySelector('.new-todo')
            .addEventListener('keyup', e => {
                console.log(e.code);

                if (e.code !== 'Enter') return;

                this.createItem(e.target.value);
                e.target.value = null;
            });

        this.container.querySelector('zen-button')
            .addEventListener('click', this.clearCompleted.bind(this));
    }


    // Retrieve a list of the items, then adds them into the list
    async getItems() {
        this.container.classList.add('loading');
        console.log(this.container.classList);


        const res = await fetch(`${this.API}/items`, {
            method: 'get',
            headers: {'content-type': 'application/json'}
        }).then(r => r.json());
        console.log('after');


        this.container.classList.remove('loading');
        this.container.classList.add('loaded');

        res.data.forEach(this.addItemToList.bind(this));
    }


    // Adds a new todo item to the list, with event listeners and default values
    async addItemToList(item) {
        const clone = this.template.cloneNode({deep: true});
        const li = clone.firstElementChild;
        this.todoList.appendChild(li);

        li.id = item.id;
        const input = li.querySelector('zen-input');
        const checkbox = li.querySelector('zen-checkbox');
        const remove = li.querySelector('zen-icon');

        input.value = item.text;
        input.disabled = Boolean(item.completed);
        checkbox.checked = Boolean(item.completed);

        // Wrap in a timeout so the change handlers don't fire straight away
        setTimeout(() => {
            input.addEventListener('change', (e) => {
                this.updateItem(item.id, {text: e.target.value});
            });

            checkbox.addEventListener('change', (e) => {
                this.checkoffItem(item.id, e.target.checked);
            });

            li.classList.toggle('completed', Boolean(item.completed));

            remove.addEventListener('click', () => this.removeItem(item.id));
        }, 2);
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

        this.updateItem(id, {completed});
    }


    async removeItem(id) {
        const res = await fetch(`${this.API}/items/${id}`, {
            method: 'delete',
            headers: {'content-type': 'application/json'}
        }).then(r => r.json());

        document.getElementById(id).remove();
    }


    async clearCompleted() {
        Array.from(this.container.querySelectorAll('li.completed'))
            .map(li => li.id)
            .forEach(this.removeItem.bind(this));
    }
}

window.addEventListener('load', () => new TodoList('.todo'));
