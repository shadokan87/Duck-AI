"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskScheduler = void 0;
/**
 * Class representing a task scheduler.
 */
class TaskScheduler {
    constructor() {
        this.queue = [];
        this.active = false;
        this.startBackgroundTask();
    }
    /**
     * Adds a task to the queue.
     * @param task - The task to be added.
     */
    addTask(task) {
        this.queue.push(task);
    }
    /**
     * Processes the task queue.
     * @returns {boolean} - Indicates whether a task was processed.
     */
    processQueue() {
        if (this.active || this.queue.length === 0) {
            return false; // Indicate that no task was processed
        }
        this.active = true;
        const task = this.queue.shift();
        if (task) {
            task.running = true;
            task.callback();
            task.running = false;
            this.active = false;
        }
        return true; // Indicate that a task was processed
    }
    /**
     * Starts the background task to process the queue.
     */
    startBackgroundTask() {
        const backgroundTask = () => {
            const didWork = this.processQueue();
            if (didWork) {
                // If a task was processed, check again immediately
                setImmediate(backgroundTask);
            }
            else {
                // If no task was processed, wait a bit before checking again to avoid tight looping
                setTimeout(backgroundTask, 100); // Check every 100ms
            }
        };
        backgroundTask(); // Start the background task
    }
}
exports.TaskScheduler = TaskScheduler;
