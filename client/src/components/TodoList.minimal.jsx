import React, { useState } from 'react'

const TodoListMinimal = ({ darkMode }) => {
  const [todos, setTodos] = useState([
    { id: 1, title: 'Test Task', status: 'pending' }
  ])

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Task Management
      </h2>
      <div className="mt-4">
        {todos.map(todo => (
          <div key={todo.id} className={`p-2 mb-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {todo.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodoListMinimal
