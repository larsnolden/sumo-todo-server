const server = require('socket.io')();

var Todo = require('./todo.js')

let State = {
  todos: []
}

let id = 0;

server.on('connection', function (client) {
  console.log(State.todos)
  server.emit('action', { type: 'LOAD_ALL', todos: State.todos })

  console.log('client connected');
  state = client.on('action', action => {
    //remove 'server/' in front of action type -> actions are the same as on the client
    action.type = action.type.split('/')[1];
    console.log(`action: ${JSON.stringify(action)}`);
    switch (action.type) {
      case 'ADD_TODO':
        let todo = new Todo(action.title, id++)
        server.emit('action', { type: 'ADD_TODO', todo });
        return Object.assign({}, State, { todos: State.todos.push(todo) })
      case 'REMOVE_TODO':
        server.emit('action', { type: 'REMOVE_TODO', id: action.id });
        return Object.assign({}, State, { todos: State.todos.filter(todo => todo.id !== action.id) })
      case 'SET_DONE_TODO':
        server.emit('action', { type: 'SET_DONE_TODO', id: action.id });
        return Object.assign({}, State, { todos: State.todos.map(todo => todo.id === action.id ? Object.defineProperty(todo, 'done', { value: (!todo.done) }) : todo) })
    }
  })
});

console.log('Waiting for clients to connect');

server.listen(3003);