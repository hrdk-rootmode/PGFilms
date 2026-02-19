import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Sparkles, 
  Users, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

const AIAdminPanel = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    text: '',
    priority: 'medium',
    category: 'work',
    subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchAnalytics();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/ai-templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/ai-categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/ai-analytics');
      const data = await response.json();
      setAnalytics(data.analytics || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const addTemplate = async () => {
    if (!newTemplate.text.trim()) return;

    try {
      const response = await fetch('/api/admin/ai-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
      const savedTemplate = await response.json();
      setTemplates([...templates, savedTemplate]);
      resetForm();
    } catch (error) {
      console.error('Error adding template:', error);
    }
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/admin/ai-templates/${editingTemplate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      });
      const updatedTemplate = await response.json();
      setTemplates(templates.map(t => t._id === editingTemplate._id ? updatedTemplate : t));
      setIsEditing(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await fetch(`/api/admin/ai-templates/${id}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    if (isEditing) {
      setEditingTemplate({
        ...editingTemplate,
        subtasks: [...(editingTemplate.subtasks || []), { text: newSubtask }]
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        subtasks: [...newTemplate.subtasks, { text: newSubtask }]
      });
    }
    setNewSubtask('');
  };

  const deleteSubtask = (index) => {
    if (isEditing) {
      setEditingTemplate({
        ...editingTemplate,
        subtasks: editingTemplate.subtasks.filter((_, i) => i !== index)
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        subtasks: newTemplate.subtasks.filter((_, i) => i !== index)
      });
    }
  };

  const resetForm = () => {
    setNewTemplate({
      text: '',
      priority: 'medium',
      category: 'work',
      subtasks: []
    });
    setNewSubtask('');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || template.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
    return colors[priority] || '#6b7280';
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : '#6b7280';
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-templates.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTemplates = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedTemplates = JSON.parse(e.target.result);
        const response = await fetch('/api/admin/ai-templates/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templates: importedTemplates })
        });
        const result = await response.json();
        if (result.success) {
          fetchTemplates();
        }
      } catch (error) {
        console.error('Error importing templates:', error);
      }
    };
    reader.readAsText(file);
  };

  const regenerateAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/ai-analytics/regenerate', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error regenerating analytics:', error);
    }
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
                <h1 className="text-2xl font-bold text-gray-900">AI Admin Panel</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Templates: {templates.length}</span>
                <span>•</span>
                <span>Categories: {categories.length}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportTemplates}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importTemplates}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4 border-b border-gray-200">
            {[
              { id: 'templates', label: 'Templates', icon: Database },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'categories', label: 'Categories', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
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
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Add/Edit Template Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isEditing ? 'Edit Template' : 'Add New Template'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={isEditing ? editingTemplate?.text || '' : newTemplate.text}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditingTemplate({ ...editingTemplate, text: e.target.value });
                      } else {
                        setNewTemplate({ ...newTemplate, text: e.target.value });
                      }
                    }}
                    placeholder="Template text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={isEditing ? editingTemplate?.priority || 'medium' : newTemplate.priority}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditingTemplate({ ...editingTemplate, priority: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, priority: e.target.value });
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {['high', 'medium', 'low'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={isEditing ? editingTemplate?.category || 'work' : newTemplate.category}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditingTemplate({ ...editingTemplate, category: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, category: e.target.value });
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Subtasks */}
              <div className="mb-4">
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
                    onClick={addSubtask}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(isEditing ? editingTemplate?.subtasks || [] : newTemplate.subtasks).map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded">
                      <span>{subtask.text}</span>
                      <button
                        onClick={() => deleteSubtask(index)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={updateTemplate}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingTemplate(null);
                      }}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addTemplate}
                    disabled={!newTemplate.text.trim()}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Template</span>
                  </button>
                )}
              </div>
            </div>

            {/* Templates List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates</h3>
              <div className="space-y-4">
                {filteredTemplates.map(template => (
                  <div key={template._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Subtasks:</p>
                            <ul className="space-y-1">
                              {template.subtasks.map((st, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-center">
                                  <Check className="w-3 h-3 text-green-500 mr-2" />
                                  {st.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingTemplate(template);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalTemplates || 0}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Usage</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.aiUsage || 0}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.avgResponseTime || '0ms'}</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Category</h3>
                <div className="space-y-3">
                  {analytics.categoryUsage?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Priority</h3>
                <div className="space-y-3">
                  {analytics.priorityUsage?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.priority}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={regenerateAnalytics}
                className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate Analytics</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{category.label}</span>
                      <span className="text-xs text-gray-500">{category.value}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-600">Color: {category.color}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdminPanel;