import express from 'express';
import { Config } from '../models/index.js';

const router = express.Router();

// Get all AI templates
router.get('/ai-templates', async (req, res) => {
  try {
    const config = await Config.findOne({ _id: 'ai-templates' });
    res.json({
      success: true,
      templates: config ? config.data : []
    });
  } catch (error) {
    console.error('Error fetching AI templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI templates'
    });
  }
});

// Add new AI template
router.post('/ai-templates', async (req, res) => {
  try {
    const { text, priority, category, subtasks } = req.body;

    if (!text || !priority || !category) {
      return res.status(400).json({
        success: false,
        message: 'Text, priority, and category are required'
      });
    }

    const newTemplate = {
      _id: Date.now().toString(),
      text,
      priority,
      category,
      subtasks: subtasks || [],
      createdAt: new Date().toISOString()
    };

    const config = await Config.findOne({ _id: 'ai-templates' });
    
    if (config) {
      config.data.push(newTemplate);
      await config.save();
    } else {
      const newConfig = new Config({
        _id: 'ai-templates',
        type: 'ai-templates',
        data: [newTemplate]
      });
      await newConfig.save();
    }

    res.json({
      success: true,
      template: newTemplate
    });
  } catch (error) {
    console.error('Error adding AI template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add AI template'
    });
  }
});

// Update AI template
router.put('/ai-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, priority, category, subtasks } = req.body;

    const config = await Config.findOne({ _id: 'ai-templates' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI templates not found'
      });
    }

    const templateIndex = config.data.findIndex(t => t._id === id);
    
    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    config.data[templateIndex] = {
      ...config.data[templateIndex],
      text: text || config.data[templateIndex].text,
      priority: priority || config.data[templateIndex].priority,
      category: category || config.data[templateIndex].category,
      subtasks: subtasks || config.data[templateIndex].subtasks,
      updatedAt: new Date().toISOString()
    };

    await config.save();

    res.json({
      success: true,
      template: config.data[templateIndex]
    });
  } catch (error) {
    console.error('Error updating AI template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AI template'
    });
  }
});

// Delete AI template
router.delete('/ai-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const config = await Config.findOne({ _id: 'ai-templates' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI templates not found'
      });
    }

    const templateIndex = config.data.findIndex(t => t._id === id);
    
    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const deletedTemplate = config.data.splice(templateIndex, 1)[0];
    await config.save();

    res.json({
      success: true,
      template: deletedTemplate
    });
  } catch (error) {
    console.error('Error deleting AI template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete AI template'
    });
  }
});

// Import AI templates
router.post('/ai-templates/import', async (req, res) => {
  try {
    const { templates } = req.body;

    if (!Array.isArray(templates)) {
      return res.status(400).json({
        success: false,
        message: 'Templates must be an array'
      });
    }

    const config = await Config.findOne({ _id: 'ai-templates' });
    
    if (config) {
      config.data = templates.map(template => ({
        ...template,
        _id: template._id || Date.now().toString() + Math.random(),
        importedAt: new Date().toISOString()
      }));
      await config.save();
    } else {
      const newConfig = new Config({
        _id: 'ai-templates',
        type: 'ai-templates',
        data: templates.map(template => ({
          ...template,
          _id: template._id || Date.now().toString() + Math.random(),
          importedAt: new Date().toISOString()
        }))
      });
      await newConfig.save();
    }

    res.json({
      success: true,
      message: `Successfully imported ${templates.length} templates`
    });
  } catch (error) {
    console.error('Error importing AI templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import AI templates'
    });
  }
});

// Get AI categories
router.get('/ai-categories', async (req, res) => {
  try {
    const categories = [
      { value: 'work', label: 'Work', color: '#3b82f6' },
      { value: 'personal', label: 'Personal', color: '#10b981' },
      { value: 'health', label: 'Health', color: '#f59e0b' },
      { value: 'finance', label: 'Finance', color: '#ef4444' },
      { value: 'learning', label: 'Learning', color: '#8b5cf6' },
      { value: 'family', label: 'Family', color: '#ec4899' },
      { value: 'project', label: 'Project', color: '#06b6d4' },
      { value: 'event', label: 'Event', color: '#84cc16' }
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching AI categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI categories'
    });
  }
});

// Get AI analytics
router.get('/ai-analytics', async (req, res) => {
  try {
    // This would typically aggregate data from usage logs
    // For now, return mock analytics
    const analytics = {
      totalTemplates: 0,
      aiUsage: 0,
      avgResponseTime: '0ms',
      categoryUsage: [],
      priorityUsage: []
    };

    const config = await Config.findOne({ _id: 'ai-templates' });
    if (config) {
      analytics.totalTemplates = config.data.length;
      
      // Mock category usage
      const categoryCounts = {};
      config.data.forEach(template => {
        categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
      });
      
      analytics.categoryUsage = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count
      }));

      // Mock priority usage
      const priorityCounts = {};
      config.data.forEach(template => {
        priorityCounts[template.priority] = (priorityCounts[template.priority] || 0) + 1;
      });
      
      analytics.priorityUsage = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count
      }));
    }

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analytics'
    });
  }
});

// Regenerate AI analytics
router.post('/ai-analytics/regenerate', async (req, res) => {
  try {
    // This would typically recalculate analytics from logs
    // For now, just return success
    res.json({
      success: true,
      message: 'Analytics regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating AI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate analytics'
    });
  }
});

// Get AI usage statistics
router.get('/ai-stats', async (req, res) => {
  try {
    const stats = {
      totalGenerated: 0,
      averageGenerationTime: 0,
      mostUsedCategories: [],
      templatePerformance: []
    };

    // Mock data for now
    stats.totalGenerated = Math.floor(Math.random() * 1000);
    stats.averageGenerationTime = Math.floor(Math.random() * 5000) + 1000;

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI stats'
    });
  }
});

export default router;