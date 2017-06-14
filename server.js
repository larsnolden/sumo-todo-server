var fs = require('fs');
var https = require('https');

var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/larsnolden.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/larsnolden.com/cert.pem')
};

var serverPort = 3003;

var server = https.createServer(options, app);
var io = require('socket.io')(server);

var Todo = require('./todo.js')

var State = {
  todos: []
}

let id = 0;

io.on('connection', function (client) {
  console.log('client connected');
  io.emit('action', { type: 'LOAD_ALL', todos: State.todos })

  let reducer = (action) => {
    //remove 'server/' in front of action type -> actions are the same as on the client
    action.type = action.type.split('/')[1];
    console.log(`action: ${JSON.stringify(action)}`);
    switch (action.type) {
      case 'ADD_TODO':
        let todo = new Todo(action.title, id++)
        io.emit('action', { type: 'ADD_TODO', todo });
        return Object.assign({}, State, { todos: State.todos.concat([todo]) })
      case 'REMOVE_TODO':
        io.emit('action', { type: 'REMOVE_TODO', id: action.id });
        return Object.assign({}, State, { todos: State.todos.filter(todo => todo.id !== action.id) })
      case 'SET_DONE_TODO':
        io.emit('action', { type: 'SET_DONE_TODO', id: action.id });
        return Object.assign({}, State, { todos: State.todos.map(todo => todo.id === action.id ? Object.defineProperty(todo, 'done', { value: (!todo.done) }) : todo) })
      case 'DELETE_ALL':
        io.emit('action', { type: 'DELETE_ALL' });
        return { todos: [] }
      case 'FINISH_ALL':
        io.emit('action', { type: 'FINISH_ALL' });
        return Object.assign({}, State, { todos: State.todos.map(todo => Object.defineProperty(todo, 'done', { value: (true) })) })
    }
  }
  client.on('action', (action) => {
    State = reducer(action)
    console.log(State)
  });
});

console.log('Waiting for clients to connect');