import React, { useState, useEffect } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './DueDiligenceChecklist.css';

// --- PROPS INTERFACE ---
interface DueDiligenceChecklistProps {
    startup: {
        _id: Id<"startups">;
        dueDiligenceChecklist?: string;
    };
}

// --- STATE & DATA STRUCTURES ---
interface ChecklistItemState {
    text: string;
    completed: boolean;
}

interface ChecklistCategoryState {
    category: string;
    icon: string;
    items: ChecklistItemState[];
    isOpen: boolean;
}

const categoryIcons: { [key: string]: string } = {
    'Financial': 'fa-solid fa-file-invoice-dollar',
    'Legal': 'fa-solid fa-scale-balanced',
    'Technical': 'fa-solid fa-gears',
    'Team': 'fa-solid fa-users',
    'Product': 'fa-solid fa-box-archive',
    'Market': 'fa-solid fa-magnifying-glass-chart',
    'Business Model': 'fa-solid fa-lightbulb',
};

// --- LOADING COMPONENT ---
const LoadingAnimation = () => {
    const [texts, setTexts] = useState(['Analyzing business plan...', 'Evaluating market research...', 'Identifying potential risks...', 'Compiling checklist categories...', 'Finalizing diligence items...']);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [texts.length]);

    return (
        <div className="loading-container">
            <div className="diligence-animation-container">
                <div className="document-icon">
                    <div className="document-line"></div>
                    <div className="document-line"></div>
                    <div className="document-line"></div>
                    <div className="document-line"></div>
                </div>
                <div className="magnifying-glass"></div>
                <i className="fa-solid fa-check checkmark-icon check-1"></i>
                <i className="fa-solid fa-check checkmark-icon check-2"></i>
                <i className="fa-solid fa-check checkmark-icon check-3"></i>
            </div>
            <div className="loading-status-text">{texts[currentIndex]}</div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const DueDiligenceChecklist: React.FC<DueDiligenceChecklistProps> = ({ startup }) => {
    const startupId = startup._id;
    const [isLoading, setIsLoading] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistCategoryState[]>([]);
    
    const generateChecklistAction = useAction(api.actions.generateDueDiligenceChecklist);
    const updateChecklistMutation = useMutation(api.startups.updateDueDiligenceChecklist);
    const checklistResult = startup?.dueDiligenceChecklist;

    // Effect for initial loading of the checklist from the database
    useEffect(() => {
        if (checklistResult) {
            try {
                const jsonStart = checklistResult.indexOf('{');
                const jsonEnd = checklistResult.lastIndexOf('}');
                if (jsonStart === -1 || jsonEnd === -1) throw new Error("Valid JSON object not found.");

                const jsonString = checklistResult.substring(jsonStart, jsonEnd + 1);
                const data = JSON.parse(jsonString);

                if (data && data.checklist) {
                    // Data from DB now includes 'completed' status, so we just add the UI state 'isOpen'
                    const structuredChecklist = data.checklist.map((cat: any) => ({
                        ...cat,
                        icon: categoryIcons[cat.category] || 'fa-solid fa-folder-open',
                        isOpen: true, // Default categories to be open
                    }));
                    setChecklist(structuredChecklist);
                } else {
                    setChecklist([]);
                }
            } catch (e) {
                console.error("Failed to parse checklist JSON on initial load:", e);
                setChecklist([]);
            }
        }
    }, [checklistResult]);

    // Effect for debounced saving of the checklist state to the database
    useEffect(() => {
        // Don't save the initial empty state
        if (checklist.length === 0) {
            return;
        }

        const handler = setTimeout(() => {
            // Create a version of the checklist for saving that excludes UI-only state like 'isOpen' and 'icon'
            const dataToSave = {
                checklist: checklist.map(cat => ({
                    category: cat.category,
                    items: cat.items,
                }))
            };

            updateChecklistMutation({
                startupId: startupId,
                dueDiligenceChecklist: JSON.stringify(dataToSave),
            });
        }, 1000); // 1-second debounce delay

        // Cleanup function to cancel the timeout if the checklist changes again
        return () => {
            clearTimeout(handler);
        };
    }, [checklist, startupId, updateChecklistMutation]);


    const handleGenerate = async () => {
        if (!startupId) return;
        setIsLoading(true);
        try {
            await generateChecklistAction({ startupId });
        } catch (error) {
            console.error('Failed to generate checklist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleItemCompletion = (categoryIndex: number, itemIndex: number) => {
        const newChecklist = [...checklist];
        newChecklist[categoryIndex].items[itemIndex].completed = !newChecklist[categoryIndex].items[itemIndex].completed;
        setChecklist(newChecklist);
    };

    const toggleCategoryOpen = (categoryIndex: number) => {
        const newChecklist = [...checklist];
        newChecklist[categoryIndex].isOpen = !newChecklist[categoryIndex].isOpen;
        setChecklist(newChecklist);
    };

    const getCategoryProgress = (categoryIndex: number) => {
        const category = checklist[categoryIndex];
        if (!category || category.items.length === 0) return 0;
        const completedItems = category.items.filter(item => item.completed).length;
        return (completedItems / category.items.length) * 100;
    };

    const getTotalProgress = () => {
        const allItems = checklist.flatMap(c => c.items);
        if (allItems.length === 0) return 0;
        const completedItems = allItems.filter(item => item.completed).length;
        return (completedItems / allItems.length) * 100;
    };

    const renderChecklist = () => {
        if (!checklist || checklist.length === 0) return null;
        const totalProgress = getTotalProgress();

        return (
            <div className="checklist-results-container">
                <div className="overall-progress-section">
                    <h4>Overall Progress</h4>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${totalProgress}%` }}></div>
                    </div>
                    <span>{Math.round(totalProgress)}%</span>
                </div>

                {checklist.map((category, catIndex) => {
                    const categoryProgress = getCategoryProgress(catIndex);
                    return (
                        <div key={catIndex} className="category-card">
                            <div className="category-header" onClick={() => toggleCategoryOpen(catIndex)}>
                                <div className="category-title">
                                    <i className={`${category.icon} mr-3`}></i>
                                    <h3>{category.category}</h3>
                                </div>
                                <div className="category-controls">
                                    <span>{Math.round(categoryProgress)}%</span>
                                    <i className={`fa-solid fa-chevron-down transition-transform ${category.isOpen ? 'rotate-180' : ''}`}></i>
                                </div>
                            </div>
                            <div className="category-progress-bar-container">
                                <div className="category-progress-bar" style={{ width: `${categoryProgress}%` }}></div>
                            </div>
                            {category.isOpen && (
                                <ul className="interactive-checklist-items">
                                    {category.items.map((item, itemIndex) => (
                                        <li
                                            key={itemIndex}
                                            className={`interactive-checklist-item ${item.completed ? 'completed' : ''}`}
                                            onClick={() => toggleItemCompletion(catIndex, itemIndex)}
                                        >
                                            <div className="checkbox">
                                                {item.completed && <i className="fa-solid fa-check"></i>}
                                            </div>
                                            <span>{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="due-diligence-container">
            {isLoading ? (
                <LoadingAnimation />
            ) : checklistResult ? (
                <>
                    <TaskResultHeader 
                        title="Due Diligence Checklist"
                        onRegenerate={handleGenerate}
                    />
                    {renderChecklist()}
                </>
            ) : (
                <InitialTaskView
                    title="Due Diligence Readiness"
                    description="Potential investors will perform due diligence before committing. Generate a personalized checklist to ensure you're prepared for their toughest questions. The AI will analyze your business plan, market research, and technical specifications to create a comprehensive list."
                    buttonText="Generate Checklist"
                    onAction={handleGenerate}
                    disabled={isLoading}
                />
            )}
        </div>
    );
};

export default DueDiligenceChecklist;
