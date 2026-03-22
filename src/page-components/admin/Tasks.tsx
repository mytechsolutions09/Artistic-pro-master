'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import TasksSecondaryNav from '../../components/admin/TasksSecondaryNav';
import { NotificationManager } from '../../components/Notification';
import { TaskService, type TaskData } from '../../services/supabaseService';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Star,
  MessageCircle,
  Paperclip,
  X,
  Edit3,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Trash2,
} from 'lucide-react';

const inputCls =
  'h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const textareaCls =
  'min-h-[4rem] w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const labelCls = 'mb-0.5 block text-[11px] font-medium text-gray-600';

type BoardStatus = 'todo' | 'inprogress' | 'review' | 'done';

export interface BoardTask {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: BoardStatus;
  dueDate: string;
  assignee: string;
  avatar: string;
  tags: string[];
  progress: number;
  comments: number;
  attachments: number;
  color: string;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') {
    try {
      const p = JSON.parse(tags);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toDbStatus(status: string): TaskData['status'] {
  if (status === 'done') return 'completed';
  if (status === 'todo' || status === 'inprogress' || status === 'review') return status;
  return 'todo';
}

function fromDbStatus(status: string): BoardStatus {
  if (status === 'completed') return 'done';
  if (status === 'todo' || status === 'inprogress' || status === 'review') return status;
  return 'todo';
}

function taskRowToBoard(row: TaskData): BoardTask | null {
  if (row.id == null) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    priority: row.priority,
    status: fromDbStatus(row.status),
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : '',
    assignee: row.assignee || '',
    avatar: row.avatar || '?',
    tags: normalizeTags(row.tags),
    progress: row.progress ?? 0,
    comments: row.comments ?? 0,
    attachments: row.attachments ?? 0,
    color: row.color || 'blue',
  };
}

function initialsFromAssignee(assignee: string): string {
  const s = assignee.trim();
  if (!s) return '?';
  return (
    s
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 6) || '?'
  );
}

interface CreateTaskFormProps {
  onSubmit: (task: any) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSubmit, onCancel, disabled }) => {
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
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      avatar: initialsFromAssignee(formData.assignee),
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <fieldset disabled={disabled} className="min-w-0 space-y-2 border-0 p-0">
      <div>
        <label className={labelCls}>Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputCls} placeholder="Title" required />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={textareaCls} placeholder="Details…" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange} className={inputCls}>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Assignee</label>
        <input type="text" name="assignee" value={formData.assignee} onChange={handleChange} className={inputCls} placeholder="Name" />
      </div>

      <div>
        <label className={labelCls}>Due date</label>
        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Tags</label>
        <input type="text" name="tags" value={formData.tags} onChange={handleChange} className={inputCls} placeholder="Comma-separated" />
      </div>

      <div>
        <label className={labelCls}>Card color</label>
        <select name="color" value={formData.color} onChange={handleChange} className={inputCls}>
          <option value="blue">Blue</option>
          <option value="orange">Orange</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="red">Red</option>
        </select>
      </div>
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="h-8 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="h-8 rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </form>
  );
};

interface EditTaskFormProps {
  task: any;
  onSubmit: (task: any) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSubmit, onCancel, disabled }) => {
  const [formData, setFormData] = useState(() => ({
    ...task,
    tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
    dueDate: task.dueDate || '',
    progress:
      task.progress != null && task.progress !== ''
        ? String(task.progress)
        : '',
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const updatedTask = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      avatar: initialsFromAssignee(formData.assignee || ''),
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <fieldset disabled={disabled} className="min-w-0 space-y-2 border-0 p-0">
      <div>
        <label className={labelCls}>Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputCls} placeholder="Title" required />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={textareaCls} placeholder="Details…" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange} className={inputCls}>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Assignee</label>
        <input type="text" name="assignee" value={formData.assignee} onChange={handleChange} className={inputCls} placeholder="Name" />
      </div>

      <div>
        <label className={labelCls}>Due date</label>
        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Tags</label>
        <input type="text" name="tags" value={formData.tags} onChange={handleChange} className={inputCls} placeholder="Comma-separated" />
      </div>

      <div>
        <label className={labelCls}>Progress (%)</label>
        <input
          type="number"
          name="progress"
          value={formData.progress}
          onChange={handleChange}
          min="0"
          max="100"
          className={inputCls}
          placeholder="0–100"
        />
      </div>

      <div>
        <label className={labelCls}>Card color</label>
        <select name="color" value={formData.color} onChange={handleChange} className={inputCls}>
          <option value="blue">Blue</option>
          <option value="orange">Orange</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="red">Red</option>
        </select>
      </div>
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="h-8 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="h-8 rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Save
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
  const [editingTask, setEditingTask] = useState<BoardTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [taskList, setTaskList] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tasksViewTab, setTasksViewTab] = useState<'board' | 'list'>('board');

  const loadTasks = useCallback(async (opts?: { soft?: boolean }) => {
    if (opts?.soft) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await TaskService.getAllTasks();
      const boards = rows.map(taskRowToBoard).filter(Boolean) as BoardTask[];
      setTaskList(boards);
    } catch (e) {
      console.error(e);
      NotificationManager.error('Failed to load tasks');
      setTaskList([]);
    } finally {
      if (opts?.soft) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [taskList, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(taskList.map((t) => t.assignee).filter(Boolean))).sort();
  }, [taskList]);

  const subbarSummary = useMemo(() => {
    const total = taskList.length;
    const shown = filteredTasks.length;
    const avatars = Array.from(
      new Set(filteredTasks.map((t) => t.avatar).filter((a) => a && a !== '?'))
    ).slice(0, 6);
    return { total, shown, avatars };
  }, [taskList.length, filteredTasks]);

  const filtersActive =
    showFilters ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assigneeFilter !== 'all';

  const handleTasksNav = (tabId: string) => {
    if (tabId === 'board') {
      setTasksViewTab('board');
    } else if (tabId === 'list') {
      setTasksViewTab('list');
    } else if (tabId === 'new') {
      setShowCreateModal(true);
    } else if (tabId === 'refresh') {
      void loadTasks({ soft: true });
    } else if (tabId === 'filters') {
      setShowFilters((open) => !open);
    }
  };

  const statusLabel = (s: BoardStatus) => {
    switch (s) {
      case 'todo':
        return 'To do';
      case 'inprogress':
        return 'In progress';
      case 'review':
        return 'In review';
      case 'done':
        return 'Done';
      default:
        return s;
    }
  };

  const createTask = async (newTask: Record<string, unknown>) => {
    setSaving(true);
    try {
      const payload: Omit<TaskData, 'id'> = {
        title: String(newTask.title || '').trim(),
        description: String(newTask.description || '').trim() || undefined,
        priority: newTask.priority as TaskData['priority'],
        status: toDbStatus(String(newTask.status)),
        due_date: String(newTask.dueDate || '') || undefined,
        assignee: String(newTask.assignee || '').trim() || undefined,
        avatar: String(newTask.avatar || '?'),
        tags: Array.isArray(newTask.tags) ? (newTask.tags as string[]) : [],
        color: String(newTask.color || 'blue'),
        progress: 0,
        comments: 0,
        attachments: 0,
      };
      const created = await TaskService.createTask(payload);
      if (created) {
        const b = taskRowToBoard(created);
        if (b) setTaskList((prev) => [b, ...prev]);
        setShowCreateModal(false);
        NotificationManager.success('Task created');
      } else {
        NotificationManager.error('Could not create task. Check Supabase tasks table and RLS.');
      }
    } finally {
      setSaving(false);
    }
  };

  const editTask = async (updatedTask: Record<string, unknown>) => {
    const id = Number(updatedTask.id);
    if (!id) return;
    setSaving(true);
    try {
      const updates: Partial<TaskData> = {
        title: String(updatedTask.title || '').trim(),
        description: String(updatedTask.description || '').trim() || undefined,
        priority: updatedTask.priority as TaskData['priority'],
        status: toDbStatus(String(updatedTask.status)),
        due_date: String(updatedTask.dueDate || '') || undefined,
        assignee: String(updatedTask.assignee || '').trim() || undefined,
        avatar: String(updatedTask.avatar || '?'),
        tags: Array.isArray(updatedTask.tags) ? (updatedTask.tags as string[]) : [],
        progress: Math.min(100, Math.max(0, Number(updatedTask.progress) || 0)),
        color: String(updatedTask.color || 'blue'),
      };
      const saved = await TaskService.updateTask(id, updates);
      if (saved) {
        const b = taskRowToBoard(saved);
        if (b) setTaskList((prev) => prev.map((t) => (t.id === id ? b : t)));
        setShowEditModal(false);
        setEditingTask(null);
        NotificationManager.success('Task updated');
      } else {
        NotificationManager.error('Could not update task');
      }
    } finally {
      setSaving(false);
    }
  };

  const changeTaskStatus = async (taskId: number, newUiStatus: BoardStatus) => {
    const task = taskList.find((t) => t.id === taskId);
    if (!task) return;

    let newProgress = task.progress;
    if (newUiStatus === 'todo') newProgress = 0;
    else if (newUiStatus === 'inprogress' && task.progress === 0) newProgress = 25;
    else if (newUiStatus === 'review' && task.progress < 90) newProgress = 95;
    else if (newUiStatus === 'done') newProgress = 100;

    const updates: Partial<TaskData> = {
      status: toDbStatus(newUiStatus),
      progress: newProgress,
    };

    const saved = await TaskService.updateTask(taskId, updates);
    if (saved) {
      const b = taskRowToBoard(saved);
      if (b) setTaskList((prev) => prev.map((t) => (t.id === taskId ? b : t)));
    } else {
      NotificationManager.error('Could not move task');
    }
  };

  const deleteEditingTask = async () => {
    if (!editingTask) return;
    if (!window.confirm('Delete this task?')) return;
    setSaving(true);
    try {
      const ok = await TaskService.deleteTask(editingTask.id);
      if (ok) {
        setTaskList((prev) => prev.filter((t) => t.id !== editingTask.id));
        setShowEditModal(false);
        setEditingTask(null);
        NotificationManager.success('Task deleted');
      } else {
        NotificationManager.error('Could not delete task');
      }
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (task: BoardTask) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const getNextStatus = (currentStatus: BoardStatus): BoardStatus => {
    const statusFlow: Record<BoardStatus, BoardStatus> = {
      todo: 'inprogress',
      inprogress: 'review',
      review: 'done',
      done: 'todo',
    };
    return statusFlow[currentStatus] ?? 'todo';
  };

  const getPreviousStatus = (currentStatus: BoardStatus): BoardStatus => {
    const statusFlow: Record<BoardStatus, BoardStatus> = {
      todo: 'done',
      inprogress: 'todo',
      review: 'inprogress',
      done: 'review',
    };
    return statusFlow[currentStatus] ?? 'todo';
  };

  const getCardColor = (color: string) => {
    const colors = {
      blue: 'border-l-blue-500 bg-blue-50/60',
      orange: 'border-l-orange-500 bg-orange-50/60',
      green: 'border-l-green-500 bg-green-50/60',
      purple: 'border-l-violet-500 bg-violet-50/60',
      pink: 'border-l-rose-500 bg-rose-50/60',
      red: 'border-l-red-500 bg-red-50/60'
    };
    return colors[color as keyof typeof colors] || 'border-l-gray-400 bg-gray-50/80';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Star className="h-3 w-3 shrink-0 fill-red-500 text-red-500" />;
      case 'important':
        return <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />;
      default:
        return null;
    }
  };

  const getColumnTasks = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getColumnColor = (status: string) => {
    const colors = {
      todo: 'border-blue-200 bg-blue-50 text-blue-800',
      inprogress: 'border-amber-200 bg-amber-50 text-amber-900',
      review: 'border-violet-200 bg-violet-50 text-violet-800',
      done: 'border-green-200 bg-green-50 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'border-gray-200 bg-gray-50 text-gray-800';
  };

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const scrollToTaskColumn = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const columnNav = [
    { id: 'task-col-todo', status: 'todo' as const, label: 'To do', dot: 'bg-blue-500' },
    { id: 'task-col-inprogress', status: 'inprogress' as const, label: 'In progress', dot: 'bg-orange-500' },
    { id: 'task-col-review', status: 'review' as const, label: 'In review', dot: 'bg-violet-500' },
    { id: 'task-col-done', status: 'done' as const, label: 'Done', dot: 'bg-green-500' },
  ];

  return (
    <AdminLayout title="Tasks" noHeader>
      <TasksSecondaryNav
        activeTab={tasksViewTab}
        onTabChange={handleTasksNav}
        filtersActive={filtersActive}
        taskCount={subbarSummary.total}
      />
      <div className="ml-24 min-h-0 space-y-4 px-4 py-5 sm:px-6">
        <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900">Tasks</h1>
              <p className="text-[11px] text-gray-500">{todayLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="relative min-w-[10rem] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputCls} pl-7`}
                />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium ${
                    showFilters || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  )}
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg sm:w-80">
                    <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <h3 className="text-xs font-semibold text-gray-900">Filters</h3>
                      <button type="button" onClick={() => setShowFilters(false)} className="rounded p-0.5 text-gray-500 hover:bg-gray-100">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className={labelCls}>Status</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
                          <option value="all">All</option>
                          <option value="todo">To Do</option>
                          <option value="inprogress">In Progress</option>
                          <option value="review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelCls}>Priority</label>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={inputCls}>
                          <option value="all">All</option>
                          <option value="urgent">Urgent</option>
                          <option value="important">Important</option>
                          <option value="normal">Normal</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelCls}>Assignee</label>
                        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className={inputCls}>
                          <option value="all">All</option>
                          {uniqueAssignees.map((assignee) => (
                            <option key={assignee} value={assignee}>
                              {assignee}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between gap-2 border-t border-gray-100 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('all');
                            setPriorityFilter('all');
                            setAssigneeFilter('all');
                          }}
                          className="text-[11px] text-gray-600 hover:text-gray-900"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFilters(false)}
                          className="h-8 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void loadTasks({ soft: true })}
                disabled={loading || refreshing}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                title="Refresh tasks"
                aria-label="Refresh tasks"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-white hover:bg-gray-800"
              >
                <Plus className="h-3.5 w-3.5" />
                New task
              </button>
            </div>
          </div>
        </div>

        {tasksViewTab === 'board' ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <aside className="rounded-lg border border-gray-200 bg-gray-50/90 p-3 shadow-sm lg:sticky lg:top-4 lg:w-52 lg:shrink-0 lg:self-start">
            <div className="mb-3 flex items-start gap-2 border-b border-gray-200/80 pb-3">
              <div className="rounded-md border border-gray-200 bg-white p-1.5 shadow-sm">
                <CheckSquare className="h-4 w-4 text-gray-600" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900">Board</p>
              </div>
            </div>

            {loading && taskList.length === 0 ? (
              <p className="mb-3 text-[11px] text-gray-500">Loading…</p>
            ) : (
              <p className="mb-3 text-[11px] tabular-nums leading-snug text-gray-600">
                {subbarSummary.shown === subbarSummary.total ? (
                  <>
                    {subbarSummary.total} task{subbarSummary.total === 1 ? '' : 's'}
                  </>
                ) : (
                  <>
                    Showing {subbarSummary.shown} of {subbarSummary.total}
                  </>
                )}
              </p>
            )}

            {subbarSummary.avatars.length > 0 ? (
              <div
                className="mb-3 flex min-h-[1.5rem] flex-wrap items-center gap-1 border-b border-gray-200/80 pb-3"
                aria-label="Assignees on this board"
              >
                <div className="flex -space-x-1.5">
                  {subbarSummary.avatars.map((avatar, index) => (
                    <div
                      key={`${avatar}-${index}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[9px] font-semibold text-gray-700"
                      title={avatar}
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">Columns</p>
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1" aria-label="Jump to column">
              {columnNav.map((col) => {
                const n = getColumnTasks(col.status).length;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => scrollToTaskColumn(col.id)}
                    disabled={loading && taskList.length === 0}
                    className="inline-flex min-w-0 w-full items-center justify-between gap-2 rounded-md border border-transparent bg-white/80 px-2 py-1.5 text-left text-[11px] font-medium text-gray-800 shadow-sm hover:border-gray-200 hover:bg-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${col.dot}`} aria-hidden />
                      <span className="truncate">{col.label}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-gray-500">{n}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
        {loading && taskList.length === 0 ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Loading tasks…</p>
          </div>
        ) : (
        <div
          id="task-board"
          className={`relative grid grid-cols-1 gap-3 scroll-mt-4 md:grid-cols-2 lg:grid-cols-4 ${refreshing ? 'opacity-60' : ''}`}
        >
          {/* To do Column */}
          <div id="task-col-todo" className="scroll-mt-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <h3 className="text-xs font-semibold text-gray-900">To do</h3>
                <span className={`rounded border px-1.5 py-px text-[10px] font-medium ${getColumnColor('todo')}`}>
                  {getColumnTasks('todo').length}
                </span>
              </div>
              <MoreHorizontal className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <div className="space-y-2">
              {getColumnTasks('todo').map((task) => (
                <div
                  key={task.id}
                  className={`cursor-pointer rounded-md border border-gray-100 border-l-2 p-2.5 transition-shadow hover:shadow-sm ${getCardColor(task.color)}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="mb-1 text-[11px] font-medium leading-snug text-gray-900">
                    {task.title}
                  </h4>
                  <div className="mb-2 flex flex-wrap gap-0.5">
                    {(task.tags ?? []).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded border border-gray-200 bg-gray-50 px-1 py-px text-[10px] text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-700">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div id="task-col-inprogress" className="scroll-mt-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                <h3 className="text-xs font-semibold text-gray-900">In progress</h3>
                <span className={`rounded border px-1.5 py-px text-[10px] font-medium ${getColumnColor('inprogress')}`}>
                  {getColumnTasks('inprogress').length}
                </span>
              </div>
              <MoreHorizontal className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <div className="space-y-2">
              {getColumnTasks('inprogress').map((task) => (
                <div
                  key={task.id}
                  className={`cursor-pointer rounded-md border border-gray-100 border-l-2 p-2.5 transition-shadow hover:shadow-sm ${getCardColor(task.color)}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="mb-1 text-[11px] font-medium leading-snug text-gray-900">
                    {task.title}
                  </h4>
                  <div className="mb-2 flex flex-wrap gap-0.5">
                    {(task.tags ?? []).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded border border-gray-200 bg-gray-50 px-1 py-px text-[10px] text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.progress > 0 && (
                    <div className="mb-2">
                      <div className="mb-0.5 flex justify-between text-[10px] text-gray-500">
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
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-700">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Review Column */}
          <div id="task-col-review" className="scroll-mt-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                <h3 className="text-xs font-semibold text-gray-900">In review</h3>
                <span className={`rounded border px-1.5 py-px text-[10px] font-medium ${getColumnColor('review')}`}>
                  {getColumnTasks('review').length}
                </span>
              </div>
              <MoreHorizontal className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <div className="space-y-2">
              {getColumnTasks('review').map((task) => (
                <div
                  key={task.id}
                  className={`cursor-pointer rounded-md border border-gray-100 border-l-2 p-2.5 transition-shadow hover:shadow-sm ${getCardColor(task.color)}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="mb-1 text-[11px] font-medium leading-snug text-gray-900">
                    {task.title}
                  </h4>
                  <div className="mb-2 flex flex-wrap gap-0.5">
                    {(task.tags ?? []).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded border border-gray-200 bg-gray-50 px-1 py-px text-[10px] text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.progress > 0 && (
                    <div className="mb-2">
                      <div className="mb-0.5 flex justify-between text-[10px] text-gray-500">
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
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-700">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div id="task-col-done" className="scroll-mt-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                <h3 className="text-xs font-semibold text-gray-900">Done</h3>
                <span className={`rounded border px-1.5 py-px text-[10px] font-medium ${getColumnColor('done')}`}>
                  {getColumnTasks('done').length}
                </span>
              </div>
              <MoreHorizontal className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <div className="space-y-2">
              {getColumnTasks('done').map((task) => (
                <div
                  key={task.id}
                  className={`cursor-pointer rounded-md border border-gray-100 border-l-2 p-2.5 opacity-80 transition-shadow hover:shadow-sm ${getCardColor(task.color)}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getPreviousStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move back"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => changeTaskStatus(task.id, getNextStatus(task.status))}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                        title="Move forward"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="mb-1 text-[11px] font-medium leading-snug text-gray-900 line-through">
                    {task.title}
                  </h4>
                  <div className="mb-2 flex flex-wrap gap-0.5">
                    {(task.tags ?? []).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded border border-gray-200 bg-gray-50 px-1 py-px text-[10px] text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-700">
                      {task.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
          </div>
        </div>
        ) : loading && taskList.length === 0 ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Loading tasks…</p>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${refreshing ? 'opacity-60' : ''}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-[11px] text-gray-800">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2.5">Task</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Priority</th>
                    <th className="px-3 py-2.5">Assignee</th>
                    <th className="px-3 py-2.5">Due</th>
                    <th className="px-3 py-2.5">Progress</th>
                    <th className="w-10 px-3 py-2.5 text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/90">
                      <td className="max-w-[14rem] px-3 py-2">
                        <span className={`font-medium text-gray-900 ${task.status === 'done' ? 'line-through opacity-70' : ''}`}>
                          {task.title}
                        </span>
                        {task.description ? (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">{task.description}</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{statusLabel(task.status)}</td>
                      <td className="whitespace-nowrap px-3 py-2 capitalize text-gray-600">{task.priority}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-600">{task.assignee || '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-600">
                        {task.dueDate || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-gray-600">{task.progress}%</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
                          className="inline-flex rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                          title="Edit task"
                          aria-label="Edit task"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTasks.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-gray-500">No tasks match your filters.</p>
            ) : null}
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
            <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                <h3 className="text-sm font-semibold text-gray-900">New task</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <CreateTaskForm
                  onSubmit={createTask}
                  onCancel={() => setShowCreateModal(false)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
            <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                <h3 className="text-sm font-semibold text-gray-900">Edit task</h3>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => void deleteEditingTask()}
                    disabled={saving}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <EditTaskForm
                  key={editingTask.id}
                  task={editingTask}
                  onSubmit={editTask}
                  onCancel={() => setShowEditModal(false)}
                  disabled={saving}
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




