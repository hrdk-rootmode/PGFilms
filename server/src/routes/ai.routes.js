import express from 'express';
import aiService from '../services/ai.service.js';

const router = express.Router();

// Generate todo templates using AI
router.post('/generate-templates', async (req, res) => {
  try {
    const { topic, processType } = req.body;

    if (!topic || !processType) {
      return res.status(400).json({
        success: false,
        message: 'Topic and process type are required'
      });
    }

    const templates = await aiService.generateTodoTemplates(topic, processType);
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error generating AI templates:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI templates'
    });
  }
});

// Analyze task complexity
router.post('/analyze-complexity', async (req, res) => {
  try {
    const { taskText } = req.body;

    if (!taskText) {
      return res.status(400).json({
        success: false,
        message: 'Task text is required'
      });
    }

    const analysis = await aiService.analyzeTaskComplexity(taskText);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing task complexity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze task complexity'
    });
  }
});

// Generate task suggestions
router.post('/suggest-tasks', async (req, res) => {
  try {
    const { category, priority } = req.body;

    if (!category || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Category and priority are required'
      });
    }

    const suggestions = await aiService.generateTaskSuggestions(category, priority);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task suggestions'
    });
  }
});

// Smart task recommendations based on user patterns
router.get('/recommendations', async (req, res) => {
  try {
    // This would analyze user's existing todos and patterns
    // For now, return generic recommendations
    const recommendations = [
      {
        category: 'work',
        suggestions: [
          'Review project milestones',
          'Update team on progress',
          'Plan next sprint tasks'
        ]
      },
      {
        category: 'personal',
        suggestions: [
          'Exercise routine check',
          'Read industry articles',
          'Plan weekend activities'
        ]
      }
    ];
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
});

export default router;