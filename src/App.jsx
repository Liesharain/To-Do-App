import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [completedTasks, setCompletedTasks] = useState(() => {
    const savedCompletedTasks = localStorage.getItem("completedTasks");
    return savedCompletedTasks ? JSON.parse(savedCompletedTasks) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskValue, setEditingTaskValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Save tasks and completedTasks to localStorage whenever they change
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [tasks, completedTasks]);

  const handleAddTask = () => {
    if (inputValue.trim() && dueDate) {
      if (inputValue.length <= 60) {
        const newTask = {
          id: Date.now(),
          text: inputValue,
          dueDate: dueDate.toLocaleString(),
          doneTime: null,
          createdTime: new Date().toLocaleString(),
        };
        setTasks([...tasks, newTask]);
        setInputValue("");
        setDueDate(null);
        setError("");
      } else {
        setError("Task should not exceed 60 characters.");
      }
    } else {
      setError("Please fill in all required details.");
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }
  };

  const handleCompleteTask = (id) => {
    setTasks((prevTasks) => {
      const taskToComplete = prevTasks.find((task) => task.id === id);
      if (taskToComplete) {
        setCompletedTasks((prevCompleted) => {
          if (!prevCompleted.some((task) => task.id === id)) {
            return [...prevCompleted, { ...taskToComplete, doneTime: new Date().toLocaleString() }];
          }
          return prevCompleted;
        });
        return prevTasks.filter((task) => task.id !== id);
      }
      return prevTasks;
    });
  };

  const handleEditTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setEditingTaskId(id);
      setEditingTaskValue(taskToEdit.text);
    }
  };

  const handleSaveTask = (id) => {
    if (editingTaskValue.trim()) {
      if (editingTaskValue.length <= 60) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, text: editingTaskValue, createdTime: new Date().toLocaleString() } : task
          )
        );
        setEditingTaskId(null);
        setEditingTaskValue("");
        setError(""); // Clear any previous error message
      } else {
        setError("Task should not exceed 60 characters.");
      }
    } else {
      setError("Task cannot be empty.");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskValue("");
  };

  const handleDeleteCompletedTask = (id) => {
    if (window.confirm("Are you sure you want to delete this completed task?")) {
      setCompletedTasks((prevCompleted) =>
        prevCompleted.filter((task) => task.id !== id)
      );
    }
  };

  const handleDeleteAllCompletedTasks = () => {
    if (window.confirm("Are you sure you want to delete all completed tasks?")) {
      setCompletedTasks([]);
    }
  };

  const handleUndoTask = (id) => {
    setCompletedTasks((prevCompleted) => {
      const taskToUndo = prevCompleted.find((task) => task.id === id);
      if (taskToUndo) {
        setTasks((prevTasks) => {
          if (!prevTasks.some((task) => task.id === id)) {
            return [...prevTasks, { ...taskToUndo, doneTime: null }];
          }
          return prevTasks;
        });
        return prevCompleted.filter((task) => task.id !== id);
      }
      return prevCompleted;
    });
  };

  const handleUndoAllTasks = () => {
    if (window.confirm("Are you sure you want to undo all completed tasks?")) {
      setTasks((prevTasks) => [
        ...prevTasks,
        ...completedTasks.map((task) => ({ ...task, doneTime: null }))
      ]);
      setCompletedTasks([]);
    }
  };

  const handleDoneAllTasks = () => {
    const now = new Date().toLocaleString();
    setCompletedTasks((prevCompleted) => [
      ...prevCompleted,
      ...tasks.map((task) => ({ ...task, doneTime: now }))
    ]);
    setTasks([]);
  };

  const handleDeleteAllTasks = () => {
    if (window.confirm("Are you sure you want to delete all tasks?")) {
      setTasks([]);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>My To-Do App</h1>
      </div>
      <div className="to-do-list">
        <h2>Tasks</h2>
        <div className="input-date-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task"
          />
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            timeCaption="    "
            dateFormat="Pp"
            placeholderText="Select due date and time"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button className="add-task-button" onClick={handleAddTask}>
            Add Task
          </button>
          <button className="done-all-button" onClick={handleDoneAllTasks}>
            Done All
          </button>
          <button className="delete-all-button" onClick={handleDeleteAllTasks}>
            Delete All
          </button>
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task">
              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editingTaskValue}
                    onChange={(e) => setEditingTaskValue(e.target.value)}
                  />
                  <div className="button-group">
                    <button className="save-button" onClick={() => handleSaveTask(task.id)}>
                      Save
                    </button>
                    <button className="cancel-button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className={task.doneTime ? "completed" : ""}>{task.text}</span>
                  <div className="task-details">
                    <span className="due-date" style={{ fontSize: '0.8em', display: 'block' }}>Due Date: {task.dueDate}</span>
                    <span className="created-time" style={{ fontSize: '0.8em', display: 'block' }}>Created: {task.createdTime}</span>
                  </div>
                  <div className="button-group">
                    <button className="edit-button" onClick={() => handleCompleteTask(task.id)}>
                      ✔️
                    </button>
                    <button className="edit-button" onClick={() => handleEditTask(task.id)}>
                      ✏️
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>
                      ❌
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="completed-tasks">
        <h2>Completed Tasks</h2>
        <div className="button-group">
          <button className="undo-all-button" onClick={handleUndoAllTasks}>
            Undo All
          </button>
          <button className="delete-all-button" onClick={handleDeleteAllCompletedTasks}>
            Delete All
          </button>
        </div>
        <div className="task-list">
          {completedTasks.map((task) => (
            <div key={task.id} className="task completed">
              <span>{task.text}</span>
              <span className="done-time">Done Time: {task.doneTime}</span>
              <div className="button-group">
                <button
                  className="completed-task-button completed-undo-button"
                  onClick={() => handleUndoTask(task.id)}
                >
                  ↩️
                </button>
                <button
                  className="completed-task-button completed-delete-button"
                  onClick={() => handleDeleteCompletedTask(task.id)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
