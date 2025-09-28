import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { CheckSquare, Plus, Clock, User, Calendar, Filter, Search, MoreHorizontal, Star, MessageCircle, Paperclip, X, Edit3, ArrowRight, ArrowLeft, Check, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { TaskService, TaskData, subscribeToTasks } from '../../services/supabaseService';

interface CreateTaskFormProps {
  onSubmit: (task: any) => void;
  onCancel: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    status: 'todo',
    assignee: '',
    dueDate: '',
    tags: '',
    color: 'blue'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newTask = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      avatar: formData.assignee.split(' ').map(name => name[0]).join('').toUpperCase()
    };

    onSubmit(newTask);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
        <input
          type="text"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter assignee name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="blue">Blue</option>
          <option value="orange">Orange</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="red">Red</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

interface EditTaskFormProps {
  task: any;
  onSubmit: (task: any) => void;
  onCancel: () => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    ...task,
    tags: task.tags.join(', '),
    dueDate: task.dueDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const updatedTask = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      avatar: formData.assignee.split(' ').map(name => name[0]).join('').toUpperCase()
    };

    onSubmit(updatedTask);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
        <input
          type="text"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter assignee name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
        <input
          type="number"
          name="progress"
          value={formData.progress}
          onChange={handleChange}
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter progress percentage"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="blue">Blue</option>
          <option value="orange">Orange</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="red">Red</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Update Task
        </button>
      </div>
    </form>
  );
};

const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const initialTasks = [
    {
      id: 1,
      title: 'Research landing page task process pages',
      description: 'Research and analyze the best practices for landing page task process optimization',
      priority: 'important',
      status: 'todo',
      dueDate: '2024-01-15',
      assignee: 'Brooklyn Simmons',
      avatar: 'BS',
      tags: ['Research', 'Website'],
      progress: 0,
      comments: 2,
      attachments: 1,
      color: 'blue'
    },
    {
      id: 2,
      title: 'How to finish the online questionnaire',
      description: 'Complete the user experience questionnaire for new features',
      priority: 'normal',
      status: 'inprogress',
      dueDate: '2024-01-12',
      assignee: 'Marketing Team',
      avatar: 'MT',
      tags: ['Questionnaire', 'UX'],
      progress: 65,
      comments: 5,
      attachments: 0,
      color: 'orange'
    },
    {
      id: 3,
      title: 'Milestone project full service launch',
      description: 'Launch the complete service with all features integrated',
      priority: 'urgent',
      status: 'inprogress',
      dueDate: '2024-01-10',
      assignee: 'Development Team',
      avatar: 'DT',
      tags: ['Milestone', 'Launch'],
      progress: 85,
      comments: 12,
      attachments: 3,
      color: 'green'
    },
    {
      id: 4,
      title: 'Create a landing page task process pages',
      description: 'Design and develop new landing pages for task management',
      priority: 'normal',
      status: 'todo',
      dueDate: '2024-01-08',
      assignee: 'Design Team',
      avatar: 'DT',
      tags: ['Design', 'Landing Page'],
      progress: 0,
      comments: 0,
      attachments: 2,
      color: 'purple'
    },
    {
      id: 5,
      title: 'Network video call definite web app design and develop',
      description: 'Complete video calling feature integration',
      priority: 'normal',
      status: 'review',
      dueDate: '2024-01-20',
      assignee: 'Full Stack Team',
      avatar: 'FS',
      tags: ['Video Call', 'Development'],
      progress: 95,
      comments: 8,
      attachments: 1,
      color: 'pink'
    },
    {
      id: 6,
      title: 'Glyph app prototype for OLX optimization in figma',
      description: 'Create app prototype with optimized user experience',
      priority: 'normal',
      status: 'review',
      dueDate: '2024-01-18',
      assignee: 'UI/UX Team',
      avatar: 'UX',
      tags: ['Prototype', 'Figma'],
      progress: 100,
      comments: 3,
      attachments: 0,
      color: 'blue'
    },
    {
      id: 7,
      title: 'Design CRM shop product page responsive website',
      description: 'Create responsive design for CRM product pages',
      priority: 'normal',
      status: 'done',
      dueDate: '2024-01-05',
      assignee: 'Web Design Team',
      avatar: 'WD',
      tags: ['CRM', 'Responsive'],
      progress: 100,
      comments: 15,
      attachments: 4,
      color: 'green'
    },
    {
      id: 8,
      title: 'Online task app design pages redesign',
      description: 'Redesign the task management interface for better UX',
      priority: 'normal',
      status: 'done',
      dueDate: '2024-01-01',
      assignee: 'Product Team',
      avatar: 'PT',
      tags: ['Redesign', 'UI/UX'],
      progress: 100,
      comments: 7,
      attachments: 2,
      color: 'red'
    }
  ];

  const [taskList, setTaskList] = useState(initialTasks);

  // Filtered tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return taskList.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [taskList, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  // Get unique assignees for filter dropdown
  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(taskList.map(task => task.assignee)));
  }, [taskList]);

  // Create new task
  const createTask = (newTask: any) => {
    const task = {
      ...newTask,
      id: Math.max(...taskList.map(t => t.id)) + 1,
      comments: 0,
      attachments: 0,
      progress: 0
    };
    setTaskList([...taskList, task]);
    setShowCreateModal(false);
  };

  // Edit existing task
  const editTask = (updatedTask: any) => {
    setTaskList(taskList.map(task => 
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    ));
    setShowEditModal(false);
    setEditingTask(null);
  };

  // Change task status
  const changeTaskStatus = (taskId: number, newStatus: string) => {
    setTaskList(taskList.map(task => {
      if (task.id === taskId) {
        let newProgress = task.progress;
        // Auto-adjust progress based on status
        if (newStatus === 'todo') newProgress = 0;
        else if (newStatus === 'inprogress' && task.progress === 0) newProgress = 25;
        else if (newStatus === 'review' && task.progress < 90) newProgress = 95;
        else if (newStatus === 'done') newProgress = 100;
        
        return { ...task, status: newStatus, progress: newProgress };
      }
      return task;
    }));
  };

  // Open edit modal
  const openEditModal = (task: any) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  // Get next status for quick actions
  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'todo': 'inprogress',
      'inprogress': 'review',
      'review': 'done',
      'done': 'todo'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || 'todo';
  };

  // Get previous status for quick actions
  const getPreviousStatus = (currentStatus: string) => {
    const statusFlow = {
      'todo': 'done',
      'inprogress': 'todo',
      'review': 'inprogress',
      'done': 'review'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || 'todo';
  };

  const getCardColor = (color: string) => {
    const colors = {
      blue: 'border-l-blue-500 bg-blue-50',
      orange: 'border-l-orange-500 bg-orange-50', 
      green: 'border-l-green-500 bg-green-50',
      purple: 'border-l-purple-500 bg-purple-50',
      pink: 'border-l-pink-500 bg-pink-50',
      red: 'border-l-red-500 bg-red-50'
    };
    return colors[color as keyof typeof colors] || 'border-l-gray-500 bg-gray-50';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Star className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'important': return <Star className="w-4 h-4 text-orange-500 fill-orange-500" />;
      default: return null;
    }
  };

  const getColumnTasks = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getColumnColor = (status: string) => {
    const colors = {
      todo: 'bg-blue-100 text-blue-800',
      inprogress: 'bg-orange-100 text-orange-800',
      review: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="">
      <div className="h-full bg-gray-50 px-6 pb-6">
        {/* Header */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">May</h1>
                  <p className="text-sm text-gray-500">Today is Saturday, Jul 8th, 2023</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Find something"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors text-sm ${
                      showFilters || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {(statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {showFilters && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Status Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="all">All Statuses</option>
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                        
                        {/* Priority Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                          <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="important">Important</option>
                            <option value="normal">Normal</option>
                          </select>
                        </div>
                        
                        {/* Assignee Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                          <select
                            value={assigneeFilter}
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="all">All Assignees</option>
                            {uniqueAssignees.map(assignee => (
                              <option key={assignee} value={assignee}>{assignee}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Clear Filters */}
                        <div className="flex justify-between pt-2">
                          <button
                            onClick={() => {
                              setStatusFilter('all');
                              setPriorityFilter('all');
                              setAssigneeFilter('all');
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Clear all filters
                          </button>
                          <button
                            onClick={() => setShowFilters(false)}
                            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create task</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Board Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Board</span>
            <span className="text-gray-500">- Daily Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {['BS', 'MT', 'DT', 'FS'].map((avatar, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                >
                  {avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
          {/* To do Column */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">To do list</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getColumnColor('todo')}`}>
                  {getColumnTasks('todo').length}
                </span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {getColumnTasks('todo').map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${getCardColor(task.color)} hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {task.comments > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.comments}</span>
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">In Progress</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getColumnColor('inprogress')}`}>
                  {getColumnTasks('inprogress').length}
                </span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {getColumnTasks('inprogress').map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${getCardColor(task.color)} hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.progress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {task.comments > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.comments}</span>
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Review Column */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">In Review</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getColumnColor('review')}`}>
                  {getColumnTasks('review').length}
                </span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {getColumnTasks('review').map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${getCardColor(task.color)} hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.progress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {task.comments > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.comments}</span>
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">Done</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getColumnColor('done')}`}>
                  {getColumnTasks('done').length}
                </span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {getColumnTasks('done').map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${getCardColor(task.color)} hover:shadow-md transition-shadow cursor-pointer opacity-75`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight line-through">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {task.comments > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.comments}</span>
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <CreateTaskForm onSubmit={createTask} onCancel={() => setShowCreateModal(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <EditTaskForm 
                  task={editingTask} 
                  onSubmit={editTask} 
                  onCancel={() => setShowEditModal(false)} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Tasks;
