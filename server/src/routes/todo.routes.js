const express = require('express');
const router = express.Router();

// Mock todo data - in production, this would be in a database
let todos = [
  {
    id: 1,
    title: 'Edit wedding photos - Johnson family',
    description: 'Complete editing 200+ photos from weekend wedding shoot',
    category: 'editing',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedTime: '4 hours',
    client: 'Johnson Family',
    reminder: true,
    createdAt: new Date().toISOString()
  }
];

// Get all todos
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new todo
router.post('/', (req, res) => {
  try {
    const newTodo = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    res.json({
      success: true,
      data: newTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update todo
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todoIndex = todos.findIndex(todo => todo.id == id);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    todos[todoIndex] = { ...todos[todoIndex], ...req.body };
    res.json({
      success: true,
      data: todos[todoIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete todo
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todoIndex = todos.findIndex(todo => todo.id == id);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    todos.splice(todoIndex, 1);
    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get AI suggestions
router.get('/ai-suggestions', (req, res) => {
  try {
    const suggestions = [
      {
        title: 'Review and edit today\'s photos',
        category: 'editing',
        priority: 'high',
        estimatedTime: '2 hours'
      },
      {
        title: 'Backup photos to cloud storage',
        category: 'backup',
        priority: 'high',
        estimatedTime: '30 mins'
      },
      {
        title: 'Respond to client inquiries',
        category: 'communication',
        priority: 'medium',
        estimatedTime: '1 hour'
      }
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
