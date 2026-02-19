import React, { useState, useEffect, useContext } from 'react';
import { Plus, Calendar, Clock, Users, Tag, Edit, Trash2, ChevronDown, ChevronUp, CheckCircle, Circle, AlertCircle, Flag, Search, Filter, Settings, PlusCircle, Sparkles } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChatContext } from '../context/ChatContext';

const localizer = momentLocalizer(moment);

const EnhancedTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('work');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'kanban'
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiProcessType, setAiProcessType] = useState(null);
  const [aiTemplates, setAiTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [expandedTodos, setExpandedTodos] = useState(new Set());
  const [bulkSelect, setBulkSelect] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const { sendMessage } = useContext(ChatContext);

  const categories = [
    { value: 'work', label: 'Work', color: '#3b82f6' },
    { value: 'personal', label: 'Personal', color: '#10b981' },
    { value: 'health', label: 'Health', color: '#f59e0b' },
    { value: 'finance', label: 'Finance', color: '#ef4444' },
    { value: 'learning', label: 'Learning', color: '#8b5cf6' },
    { value: 'family', label: 'Family', color: '#ec4899' }
  ];

  const priorities = [
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'low', label: 'Low', color: '#10b981' }
  ];

  const assignees = [
    { value: 'you', label: 'You' },
    { value: 'team', label: 'Team' },
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor' }
  ];

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    if (selectedTodos.size > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectedTodos]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const todo = {
      text: newTodo,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      assignee,
      tags,
      category,
      completed: false,
      subtasks: subtasks.map(st => ({ ...st, completed: false })),
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
      });
      const savedTodo = await response.json();
      setTodos([...todos, savedTodo]);
      resetForm();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t._id === id);
    await updateTodo(id, { completed: !todo.completed });
  };

  const addSubtask = (todoId) => {
    const todo = todos.find(t => t._id === todoId);
    const newSubtaskObj = { text: newSubtask, completed: false };
    const updatedSubtasks = [...(todo.subtasks || []), newSubtaskObj];
    updateTodo(todoId, { subtasks: updatedSubtasks });
    setNewSubtask('');
  };

  const toggleSubtask = (todoId, subtaskIndex) => {
    const todo = todos.find(t => t._id === todoId);
    const updatedSubtasks = todo.subtasks.map((st, index) =>
      index === subtaskIndex ? { ...st, completed: !st.completed } : st
    );
    updateTodo(todoId, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = (todoId, subtaskIndex) => {
    const todo = todos.find(t => t._id === todoId);
    const updatedSubtasks = todo.subtasks.filter((_, index) => index !== subtaskIndex);
    updateTodo(todoId, { subtasks: updatedSubtasks });
  };

  const resetForm = () => {
    setNewTodo('');
    setPriority('medium');
    setDueDate(null);
    setAssignee('');
    setTags([]);
    setCategory('work');
    setSubtasks([]);
    setIsAdding(false);
    setEditingTodo(null);
  };

  const handleAIIntegration = async () => {
    if (!aiTopic.trim() || !aiProcessType) return;

    try {
      const response = await fetch('/api/ai/generate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          processType: aiProcessType
        })
      });

      const data = await response.json();
      
      if (data.success && data.templates) {
        setAiTemplates(data.templates);
        setShowTemplates(true);
      } else {
        console.error('AI generation failed:', data.message);
      }
    } catch (error) {
      console.error('Error with AI integration:', error);
    }
  };

  const applyTemplate = (template) => {
    setNewTodo(template.text);
    setPriority(template.priority || 'medium');
    setCategory(template.category || 'work');
    if (template.subtasks) {
      setSubtasks(template.subtasks.map(st => ({ ...st, completed: false })));
    }
    setShowTemplates(false);
    setAiTemplates([]);
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || todo.category === filterCategory;
      const matchesAssignee = filterAssignee === 'all' || todo.assignee === filterAssignee;
      return matchesSearch && matchesPriority && matchesCategory && matchesAssignee;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date(0);
          bValue = b.dueDate ? new Date(b.dueDate) : new Date(0);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getPriorityColor = (priority) => {
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
    return colors[priority] || '#6b7280';
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : '#6b7280';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const getCalendarEvents = todos.map(todo => ({
    id: todo._id,
    title: todo.text,
    start: todo.dueDate ? new Date(todo.dueDate) : new Date(),
    end: todo.dueDate ? new Date(todo.dueDate) : new Date(),
    allDay: false,
    priority: todo.priority,
    category: todo.category
  }));

  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedTodos);
    
    if (action === 'delete') {
      for (const id of ids) {
        await deleteTodo(id);
      }
    } else if (action === 'complete') {
      for (const id of ids) {
        await updateTodo(id, { completed: true });
      }
    } else if (action === 'priority') {
      for (const id of ids) {
        await updateTodo(id, { priority: priority });
      }
    }

    setSelectedTodos(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Todo List</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Total: {todos.length}</span>
                <span>•</span>
                <span>Active: {todos.filter(t => !t.completed).length}</span>
                <span>•</span>
                <span>Completed: {todos.filter(t => t.completed).length}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAIOptions(!showAIOptions)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="list">List View</option>
                <option value="calendar">Calendar View</option>
                <option value="kanban">Kanban View</option>
              </select>
            </div>
          </div>

          {/* AI Assistant Panel */}
          {showAIOptions && (
            <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Task Generator</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., Project launch, Website redesign"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Process Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="single"
                        checked={aiProcessType === 'single'}
                        onChange={(e) => setAiProcessType(e.target.value)}
                        className="mr-2"
                      />
                      Single Process
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="subprocess"
                        checked={aiProcessType === 'subprocess'}
                        onChange={(e) => setAiProcessType(e.target.value)}
                        className="mr-2"
                      />
                      Sub Process (2-3 tasks)
                    </label>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAIIntegration}
                    disabled={!aiTopic.trim() || !aiProcessType}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Generate Templates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Templates Panel */}
          {showTemplates && aiTemplates.length > 0 && (
            <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiTemplates.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">{template.text}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <span className={`px-2 py-1 rounded-full text-white text-xs`} style={{ backgroundColor: getPriorityColor(template.priority) }}>
                        {template.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-white text-xs`} style={{ backgroundColor: getCategoryColor(template.category) }}>
                        {template.category}
                      </span>
                    </div>
                    {template.subtasks && template.subtasks.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Subtasks:</p>
                        <ul className="space-y-1">
                          {template.subtasks.map((st, stIndex) => (
                            <li key={stIndex} className="text-sm text-gray-700 flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                              {st.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => applyTemplate(template)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Assignees</option>
              {assignees.map(assignee => (
                <option key={assignee.value} value={assignee.value}>{assignee.label}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isAdding ? 'Cancel' : 'Add Task'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="mt-4 flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Selected: {selectedTodos.size}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => handleBulkAction('priority')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Set Priority
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Assignee</option>
                {assignees.map(assignee => (
                  <option key={assignee.value} value={assignee.value}>{assignee.label}</option>
                ))}
              </select>
            </div>
            
            {/* Subtasks */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Subtasks</span>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => setSubtasks([...subtasks, { text: newSubtask, completed: false }])}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              {subtasks.length > 0 && (
                <div className="space-y-2">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => setSubtasks(subtasks.map((st, i) => i === index ? { ...st, completed: !st.completed } : st))}
                      />
                      <span className={subtask.completed ? 'line-through text-gray-500' : ''}>{subtask.text}</span>
                      <button
                        onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <DatePicker
                  selected={dueDate}
                  onChange={date => setDueDate(date)}
                  placeholderText="Select due date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <BigCalendar
              localizer={localizer}
              events={getCalendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: getCategoryColor(event.category),
                  borderColor: getPriorityColor(event.priority),
                  color: 'white'
                }
              })}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTodos.map(todo => (
              <div
                key={todo._id}
                className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 ${
                  todo.completed ? 'opacity-75' : ''
                } ${selectedTodos.has(todo._id) ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {bulkSelect && (
                      <input
                        type="checkbox"
                        checked={selectedTodos.has(todo._id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedTodos);
                          if (e.target.checked) newSet.add(todo._id);
                          else newSet.delete(todo._id);
                          setSelectedTodos(newSet);
                        }}
                        className="mt-1"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <button
                          onClick={() => toggleTodo(todo._id)}
                          className={`p-1 rounded-full transition-colors ${
                            todo.completed ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-green-500'
                          }`}
                        >
                          {todo.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        
                        <h3 className={`text-lg font-semibold ${
                          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {todo.text}
                        </h3>
                        
                        {isOverdue(todo.dueDate) && !todo.completed && (
                          <AlertCircle className="w-5 h-5 text-red-500" title="Overdue" />
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span className={`px-2 py-1 rounded-full text-white text-xs`} style={{ backgroundColor: getPriorityColor(todo.priority) }}>
                          {todo.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-white text-xs`} style={{ backgroundColor: getCategoryColor(todo.category) }}>
                          {todo.category}
                        </span>
                        {todo.dueDate && (
                          <>
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                        {todo.assignee && (
                          <>
                            <Users className="w-4 h-4" />
                            <span>{todo.assignee}</span>
                          </>
                        )}
                      </div>

                      {/* Subtasks */}
                      {todo.subtasks && todo.subtasks.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => {
                              const newSet = new Set(expandedTodos);
                              if (newSet.has(todo._id)) newSet.delete(todo._id);
                              else newSet.add(todo._id);
                              setExpandedTodos(newSet);
                            }}
                            className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <span>{expandedTodos.has(todo._id) ? 'Hide' : 'Show'} Subtasks</span>
                            {expandedTodos.has(todo._id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {expandedTodos.has(todo._id) && (
                            <div className="mt-3 space-y-2">
                              {todo.subtasks.map((subtask, index) => (
                                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => toggleSubtask(todo._id, index)}
                                  />
                                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>{subtask.text}</span>
                                  <button
                                    onClick={() => deleteSubtask(todo._id, index)}
                                    className="text-red-500 hover:text-red-700 ml-auto"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {todo.tags && todo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {todo.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTodo(todo._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTodoList;