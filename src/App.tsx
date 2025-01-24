import { useState, useEffect } from 'react';
import { ChevronDown, Folder, Bolt, X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  duration: number;
  dueDate: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      text: 'Complete project documentation', 
      completed: false,
      category: 'Work',
      duration: 120,
      dueDate: '2025-01-25'
    },
    { 
      id: '2', 
      text: 'Review team pull requests', 
      completed: true,
      category: 'Code Review',
      duration: 45,
      dueDate: '2025-01-23'
    },
    { 
      id: '3', 
      text: 'Prepare weekly meeting agenda', 
      completed: false,
      category: 'Planning',
      duration: 30,
      dueDate: '2025-01-24'
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Work');
  const [taskDuration, setTaskDuration] = useState(30);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.completed).length,
    upcomingTasks: tasks.filter(task => !task.completed).length,
    totalTime: tasks.reduce((sum, task) => sum + task.duration, 0)
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      text: inputText,
      completed: false,
      category: selectedCategory,
      duration: taskDuration,
      dueDate: dueDate || 'No deadline'
    };

    setTasks([...tasks, newTask]);
    setInputText('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = async (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    if (!tasks.find(t => t.id === id)?.completed) {
      setIsLoadingMessage(true);
      try {
        const response = await axios.post(
          'https://api.deepseek.com/v1/chat/completions',
          {
            model: 'deepseek-chat',
            messages: [{
              role: 'user',
              content: 'Generate a short motivational quote about productivity'
            }]
          },
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMotivationalMessage(response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error fetching motivation:', error);
        setMotivationalMessage('Stay focused and keep making progress!');
      } finally {
        setIsLoadingMessage(false);
      }
    }
  };

  const [stickyNotes, setStickyNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    lists: true,
    tags: true
  });

  const taskCategories = [
    { 
      name: 'Banner Ads', 
      subtasks: ['Design variations', 'Copy testing', 'CTR analysis'],
      expanded: true
    },
    {
      name: 'Email A/B Tests',
      subtasks: ['Subject lines', 'Preview text', 'Call-to-action'],
      expanded: false
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-100 transition-all duration-300 shadow-xl backdrop-blur-sm`}>
        <div className="p-4 border-b border-gray-100/50">
          <div className="flex items-center gap-3 justify-center mb-4">
            <Bolt size={28} className="text-blue-500/90" />
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-blue-600/90 tracking-tight">
                ToDoApp
              </h1>
            )}
          </div>
          
          {/* Enhanced TASKS Section */}
          <div className="mb-4">
            <button 
              onClick={() => setExpandedSections(prev => ({...prev, tasks: !prev.tasks}))}
              className="flex items-center justify-between w-full p-2 -ml-2 rounded-lg hover:bg-white/30 transition-colors group"
            >
              <span className="text-sm font-medium text-blue-600/90 group-hover:text-blue-800">TASKS</span>
              <ChevronDown size={16} className={`transition-transform text-blue-400 ${expandedSections.tasks ? 'rotate-0' : '-rotate-90'}`}/>
            </button>
            {expandedSections.tasks && (
              <div className="mt-2 space-y-1 ml-1">
                {['Upcoming', 'Today', 'Calendar'].map((item) => {
                  const count = tasks.filter(task => {
                    const today = new Date().toISOString().split('T')[0];
                    switch(item) {
                      case 'Today': return task.dueDate === today;
                      case 'Upcoming': return task.dueDate > today;
                      default: return true;
                    }
                  }).length;
                
                  return (
                    <button 
                      key={item}
                      onClick={() => {
                        if (item === 'Inbox') setSelectedFilter('all');
                        if (item === 'Today') {
                          const today = new Date().toISOString().split('T')[0];
                          setSearchQuery(today);
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-slate-700/90 hover:text-blue-600 w-full justify-between p-2 rounded-lg hover:bg-white/40 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Bolt size={16} className="text-blue-400/80" />
                        {sidebarOpen && <span className="font-medium">{item}</span>}
                      </div>
                      {sidebarOpen && (
                        <span className="bg-white/80 px-2 py-1 rounded-full text-xs shadow-sm">
                          {count}
                        </span>
                      )}
                    </button>
                );
              })}
            </div>
          )}
          </div>

          {/* Enhanced Tags Section */}
          <div className="border-t border-gray-100/50 pt-4">
            <h3 className="flex items-center gap-2 text-slate-600/90 mb-2 px-2">
              <Folder size={16} className="text-blue-400/80" />
              {sidebarOpen && <span className="text-sm font-medium">Categories</span>}
            </h3>
            <div className="space-y-1 ml-1">
              {['Work', 'Personal', 'Errands', 'Learning'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setSelectedFilter(tag)}
                  className={`flex items-center gap-2 text-sm w-full p-2 rounded-lg transition-all ${
                    selectedFilter === tag 
                      ? 'bg-white/90 text-blue-600 shadow-sm font-medium' 
                      : 'text-slate-600/90 hover:bg-white/40 hover:text-blue-500'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400/80" />
                  {sidebarOpen && tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <form onSubmit={addTask} className="flex items-center gap-4">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Task description"
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select 
                  className="p-2 border rounded-lg bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option>Work</option>
                  <option>Personal</option>
                  <option>Errands</option>
                  <option>Learning</option>
                </select>
                <input
                  type="number"
                  placeholder="Minutes"
                  min="1"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              + Add Task
            </button>
          </form>
        </header>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-2 gap-8 p-8">
          {/* Task Cards */}
          <div className="space-y-4">
            {tasks
              .filter(task => 
                task.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (selectedFilter === 'all' || task.category === selectedFilter)
              )
              .map((task) => (
              <div 
                key={task.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className={`${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {task.text}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-1 rounded mr-2">{task.category}</span>
                      <span>⏳ {task.duration} mins</span>
                      <span>📅 {task.dueDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Productivity Stats</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Total Tasks</span>
                    <span>{stats.totalTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Completed</span>
                    <span>{stats.completedTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Upcoming</span>
                    <span>{stats.upcomingTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Total Time</span>
                    <span>{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</span>
                  </div>
                </div>
              </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700">Quick Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'Work', 'Personal', 'Errands', 'Learning'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`p-2 text-sm rounded-lg ${
                        selectedFilter === filter 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Productivity Tip</h2>
                {isLoadingMessage ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Generating motivation...
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 italic animate-fade-in">
                    "{motivationalMessage || 'Complete tasks to unlock motivational quotes!'}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
