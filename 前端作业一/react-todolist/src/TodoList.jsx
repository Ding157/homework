import React, { useState, useEffect } from 'react';
import './TodoList.css';

const TodoList = () => {
  // 从 localStorage 加载初始数据
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [inputValue, setInputValue] = useState('');

  // 当 todos 变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 其他函数保持不变...
  const handleAddTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date().toLocaleString()
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  // 清空所有待办事项
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有待办事项吗？')) {
      setTodos([]);
    }
  };

  return (
    <div className="todo-container">
      <h1>Todo List</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="添加新的待办事项..."
          className="todo-input"
        />
        <button onClick={handleAddTodo} className="add-button">
          添加
        </button>
      </div>

      <div className="todo-stats">
        <span>总计: {todos.length}</span>
        <span>已完成: {todos.filter(todo => todo.completed).length}</span>
        <span>待完成: {todos.filter(todo => !todo.completed).length}</span>
        {todos.length > 0 && (
          <button onClick={handleClearAll} className="clear-button">
            清空全部
          </button>
        )}
      </div>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty-message">暂无待办事项，开始添加你的第一个任务吧！</li>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id)}
                  className="checkbox"
                />
                <div className="todo-text">
                  <span>{todo.text}</span>
                  <small className="todo-time">{todo.createdAt}</small>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="delete-button"
              >
                删除
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TodoList;