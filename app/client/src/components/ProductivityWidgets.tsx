import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  Calendar,
  CheckSquare,
  Radio,
  Waves,
  BarChart,
  Activity,
  Timer,
  RefreshCcw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

/**
 * Mini productivity widgets for the sidebar
 * Includes: Pomodoro Timer, Todo List, Weather Widget, etc.
 */
export default function ProductivityWidgets() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        Productivity Tools
      </h2>
      
      <PomodoroTimer />
      <TodoWidget />
      <FocusWidget />
      <DailyStatsWidget />
    </div>
  );
}

/**
 * Pomodoro Timer Widget
 */
function PomodoroTimer() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [cycles, setCycles] = useState(0);
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive && !isPaused) {
      interval = window.setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            // Time's up, switch modes
            if (mode === 'work') {
              // Switch to break
              setMode('break');
              setCycles(c => c + 1);
              return cycles % 4 === 0 ? 15 * 60 : 5 * 60; // Long break every 4 cycles
            } else {
              // Switch back to work
              setMode('work');
              return 25 * 60;
            }
          }
          return time - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, mode, cycles]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
    setIsPaused(false);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(25 * 60);
    setMode('work');
  };
  
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const totalTime = mode === 'work' ? 25 * 60 : (cycles % 4 === 0 ? 15 * 60 : 5 * 60);
  const progress = ((totalTime - time) / totalTime) * 100;
  
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Pomodoro Timer
          </div>
          <div className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded">
            {mode === 'work' ? 'Work' : 'Break'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <div className="text-center">
          <span className="text-3xl font-bold tracking-tighter">{formatTime(time)}</span>
        </div>
        
        <Progress value={progress} className="h-1.5" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cycle: {cycles}</span>
          <span>{mode === 'work' ? 'Focus time' : 'Rest time'}</span>
        </div>
        
        <div className="flex justify-center space-x-2 pt-1">
          <Button 
            variant={isActive ? "destructive" : "default"} 
            size="sm" 
            onClick={toggleTimer}
            className="h-8 px-3"
          >
            {isActive ? 'Stop' : 'Start'}
          </Button>
          
          {isActive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={togglePause}
              className="h-8 px-3"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetTimer}
            className="h-8 px-3"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Todo Widget
 */
function TodoWidget() {
  // Get todo items from localStorage or initialize with empty array
  const getSavedTodos = (): string[] => {
    try {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load todos', e);
      return [];
    }
  };
  
  const [todos, setTodos] = useState(getSavedTodos());
  const [newTodo, setNewTodo] = useState('');
  
  // Save todos whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };
  
  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };
  
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          Quick Tasks
        </CardTitle>
        <CardDescription className="text-xs">
          Add your email campaign tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3 pt-2">
        <div className="flex space-x-2">
          <Input 
            placeholder="Add a task..." 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8" onClick={addTodo}>Add</Button>
        </div>
        
        <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
          {todos.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-2">
              No tasks yet
            </div>
          ) : (
            todos.map((todo, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary/20 rounded-lg p-2 text-sm">
                <span className="truncate mr-2">{todo}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full" 
                  onClick={() => removeTodo(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Focus Mode Widget
 */
function FocusWidget() {
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(false);
  const [volume, setVolume] = useState([50]);
  
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          Focus Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="focus-mode" className="text-sm">Focus Mode</Label>
          <Switch 
            id="focus-mode" 
            checked={focusModeEnabled}
            onCheckedChange={setFocusModeEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="ambient-sound" className="text-sm">Ambient Sound</Label>
          <Switch 
            id="ambient-sound" 
            checked={ambientSoundEnabled}
            onCheckedChange={setAmbientSoundEnabled}
          />
        </div>
        
        {ambientSoundEnabled && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="volume" className="text-xs text-muted-foreground">
                Volume
              </Label>
              <span className="text-xs text-muted-foreground">{volume[0]}%</span>
            </div>
            <Slider 
              id="volume"
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={5}
              className="pt-1"
            />
            
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex items-center justify-center"
              >
                <Waves className="h-3 w-3 mr-1" />
                Rain
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
              >
                <Waves className="h-3 w-3 mr-1" />
                Ocean
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Daily Stats Widget
 */
function DailyStatsWidget() {
  // Get today's date in a readable format
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  
  // Generate some example stats
  const emailsSent = localStorage.getItem('statsEmailsSent') 
    ? parseInt(localStorage.getItem('statsEmailsSent')!, 10) 
    : 0;
  
  const openRate = localStorage.getItem('statsOpenRate') 
    ? parseFloat(localStorage.getItem('statsOpenRate')!) 
    : 0;
    
  const tasks = localStorage.getItem('statsTasks') 
    ? parseInt(localStorage.getItem('statsTasks')!, 10) 
    : 0;
  
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart className="h-4 w-4 text-primary" />
          Daily Stats
        </CardTitle>
        <CardDescription className="text-xs">
          {today}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Emails Sent
            </span>
            <span className="font-medium">{emailsSent}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center">
              <Activity className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Open Rate
            </span>
            <span className="font-medium">{openRate.toFixed(1)}%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center">
              <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Tasks Complete
            </span>
            <span className="font-medium">{tasks}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full text-xs h-7 flex items-center gap-1">
          <RefreshCcw className="h-3 w-3" />
          Refresh Stats
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Missing import from the props
 */
function Mail(props: any) {
  return <svg 
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>;
}