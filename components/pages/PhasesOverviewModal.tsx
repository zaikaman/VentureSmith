import React from 'react';
import './PhasesOverviewModal.css';
import { TaskID } from '../../types';

interface Task {
    id: TaskID;
    name: string;
    isCompleted: boolean;
}

interface Phase {
    id: string;
    name: string;
    tasks: Task[];
}

interface PhasesOverviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    phases: Phase[];
    onTaskClick: (taskId: TaskID) => void;
    activeTask: TaskID;
}

export const PhasesOverviewModal: React.FC<PhasesOverviewModalProps> = ({ isOpen, onClose, phases, onTaskClick, activeTask }) => {
    if (!isOpen) return null;

    const allTasks = phases.flatMap(phase => phase.tasks);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Venture Blueprint</h2>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="phases-grid">
                        {phases.map(phase => (
                            <div key={phase.id} className="phase-column">
                                <h3 className="phase-title">{phase.name}</h3>
                                <ul className="phase-task-list">
                                    {phase.tasks.map(task => {
                                        const globalTaskIndex = allTasks.findIndex(t => t.id === task.id);
                                        const isLocked = globalTaskIndex > 0 && !allTasks[globalTaskIndex - 1].isCompleted;
                                        return (
                                            <li 
                                                key={task.id}
                                                className={`modal-task-item ${task.isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${activeTask === task.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (!isLocked) {
                                                        onTaskClick(task.id);
                                                        onClose(); // Close modal on selection
                                                    }
                                                }}
                                            >
                                                <span className="task-status-icon">
                                                    {isLocked ? '🔒' : (task.isCompleted ? '✅' : '🔲')}
                                                </span>
                                                <span>{task.name}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};