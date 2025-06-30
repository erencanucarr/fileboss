package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// UndoAction represents a single undo action
type UndoAction struct {
	ID          string         `json:"id"`
	Type        string         `json:"type"` // "rename", "move", "delete"
	Timestamp   time.Time      `json:"timestamp"`
	Description string         `json:"description"`
	OldPath     string         `json:"oldPath"`
	NewPath     string         `json:"newPath"`
	BackupPath  string         `json:"backupPath,omitempty"`
	Metadata    ActionMetadata `json:"metadata"`
}

// ActionMetadata contains additional information about the action
type ActionMetadata struct {
	FileSize    int64             `json:"fileSize"`
	FileMode    os.FileMode       `json:"fileMode"`
	ModTime     time.Time         `json:"modTime"`
	UserData    map[string]string `json:"userData,omitempty"`
	BatchID     string            `json:"batchId,omitempty"`
	OperationID string            `json:"operationId,omitempty"`
}

// UndoManager manages undo/redo operations
type UndoManager struct {
	MaxHistory    int          `json:"maxHistory"`
	UndoStack     []UndoAction `json:"undoStack"`
	RedoStack     []UndoAction `json:"redoStack"`
	BackupBaseDir string       `json:"backupBaseDir"`
	CurrentBatch  string       `json:"currentBatch,omitempty"`
}

// NewUndoManager creates a new undo manager
func NewUndoManager(maxHistory int, backupDir string) *UndoManager {
	return &UndoManager{
		MaxHistory:    maxHistory,
		UndoStack:     make([]UndoAction, 0),
		RedoStack:     make([]UndoAction, 0),
		BackupBaseDir: backupDir,
	}
}

// BeginBatch starts a new batch operation
func (um *UndoManager) BeginBatch(description string) string {
	batchID := fmt.Sprintf("batch_%d", time.Now().UnixNano())
	um.CurrentBatch = batchID
	return batchID
}

// EndBatch ends the current batch operation
func (um *UndoManager) EndBatch() {
	um.CurrentBatch = ""
}

// AddAction adds a new action to the undo stack
func (um *UndoManager) AddAction(actionType, description, oldPath, newPath string, metadata ActionMetadata) error {
	action := UndoAction{
		ID:          fmt.Sprintf("action_%d", time.Now().UnixNano()),
		Type:        actionType,
		Timestamp:   time.Now(),
		Description: description,
		OldPath:     oldPath,
		NewPath:     newPath,
		Metadata:    metadata,
	}

	// Set batch ID if in batch mode
	if um.CurrentBatch != "" {
		action.Metadata.BatchID = um.CurrentBatch
	}

	// Create backup if needed
	if actionType == "rename" || actionType == "move" {
		backupPath, err := um.createBackup(oldPath)
		if err != nil {
			return fmt.Errorf("backup creation failed: %v", err)
		}
		action.BackupPath = backupPath
	}

	// Add to undo stack
	um.UndoStack = append(um.UndoStack, action)

	// Clear redo stack when new action is added
	um.RedoStack = make([]UndoAction, 0)

	// Maintain max history limit
	if len(um.UndoStack) > um.MaxHistory {
		// Remove oldest action and its backup
		oldAction := um.UndoStack[0]
		if oldAction.BackupPath != "" {
			os.RemoveAll(oldAction.BackupPath)
		}
		um.UndoStack = um.UndoStack[1:]
	}

	return nil
}

// Undo performs undo operation
func (um *UndoManager) Undo() (*UndoAction, error) {
	if len(um.UndoStack) == 0 {
		return nil, fmt.Errorf("no actions to undo")
	}

	// Get last action
	action := um.UndoStack[len(um.UndoStack)-1]
	um.UndoStack = um.UndoStack[:len(um.UndoStack)-1]

	// Perform undo based on action type
	err := um.performUndo(&action)
	if err != nil {
		// Restore action to stack if undo failed
		um.UndoStack = append(um.UndoStack, action)
		return nil, fmt.Errorf("undo failed: %v", err)
	}

	// Add to redo stack
	um.RedoStack = append(um.RedoStack, action)

	return &action, nil
}

// Redo performs redo operation
func (um *UndoManager) Redo() (*UndoAction, error) {
	if len(um.RedoStack) == 0 {
		return nil, fmt.Errorf("no actions to redo")
	}

	// Get last redo action
	action := um.RedoStack[len(um.RedoStack)-1]
	um.RedoStack = um.RedoStack[:len(um.RedoStack)-1]

	// Perform redo based on action type
	err := um.performRedo(&action)
	if err != nil {
		// Restore action to redo stack if redo failed
		um.RedoStack = append(um.RedoStack, action)
		return nil, fmt.Errorf("redo failed: %v", err)
	}

	// Add back to undo stack
	um.UndoStack = append(um.UndoStack, action)

	return &action, nil
}

// UndoBatch undoes all actions in a batch
func (um *UndoManager) UndoBatch(batchID string) ([]UndoAction, error) {
	var batchActions []UndoAction
	var remainingActions []UndoAction

	// Find and collect batch actions
	for i := len(um.UndoStack) - 1; i >= 0; i-- {
		action := um.UndoStack[i]
		if action.Metadata.BatchID == batchID {
			batchActions = append(batchActions, action)
		} else {
			remainingActions = append([]UndoAction{action}, remainingActions...)
		}
	}

	if len(batchActions) == 0 {
		return nil, fmt.Errorf("batch not found: %s", batchID)
	}

	// Undo actions in reverse order
	var undoneActions []UndoAction
	for _, action := range batchActions {
		err := um.performUndo(&action)
		if err != nil {
			return undoneActions, fmt.Errorf("batch undo failed at action %s: %v", action.ID, err)
		}
		undoneActions = append(undoneActions, action)
		um.RedoStack = append(um.RedoStack, action)
	}

	// Update undo stack without batch actions
	um.UndoStack = remainingActions

	return undoneActions, nil
}

// performUndo executes the actual undo operation
func (um *UndoManager) performUndo(action *UndoAction) error {
	switch action.Type {
	case "rename":
		// Restore from backup
		if action.BackupPath != "" {
			return um.restoreFromBackup(action.BackupPath, action.OldPath)
		}
		// Or simply rename back
		return os.Rename(action.NewPath, action.OldPath)

	case "move":
		return os.Rename(action.NewPath, action.OldPath)

	case "delete":
		if action.BackupPath != "" {
			return um.restoreFromBackup(action.BackupPath, action.OldPath)
		}
		return fmt.Errorf("no backup available for deleted file")

	default:
		return fmt.Errorf("unknown action type: %s", action.Type)
	}
}

// performRedo executes the actual redo operation
func (um *UndoManager) performRedo(action *UndoAction) error {
	switch action.Type {
	case "rename":
		return os.Rename(action.OldPath, action.NewPath)

	case "move":
		return os.Rename(action.OldPath, action.NewPath)

	case "delete":
		return os.Remove(action.OldPath)

	default:
		return fmt.Errorf("unknown action type: %s", action.Type)
	}
}

// createBackup creates a backup of the file
func (um *UndoManager) createBackup(filePath string) (string, error) {
	// Create backup directory
	backupDir := filepath.Join(um.BackupBaseDir, "undo_backups", time.Now().Format("2006-01-02"))
	err := os.MkdirAll(backupDir, 0755)
	if err != nil {
		return "", err
	}

	// Generate unique backup filename
	fileName := filepath.Base(filePath)
	backupName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), fileName)
	backupPath := filepath.Join(backupDir, backupName)

	// Copy file to backup location
	return backupPath, um.copyFile(filePath, backupPath)
}

// restoreFromBackup restores a file from backup
func (um *UndoManager) restoreFromBackup(backupPath, targetPath string) error {
	// Ensure target directory exists
	targetDir := filepath.Dir(targetPath)
	err := os.MkdirAll(targetDir, 0755)
	if err != nil {
		return err
	}

	return um.copyFile(backupPath, targetPath)
}

// copyFile copies a file from src to dst
func (um *UndoManager) copyFile(src, dst string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	// Copy file content
	_, err = srcFile.WriteTo(dstFile)
	if err != nil {
		return err
	}

	// Copy file metadata
	srcInfo, err := srcFile.Stat()
	if err != nil {
		return err
	}

	return os.Chmod(dst, srcInfo.Mode())
}

// GetHistory returns the current undo/redo history
func (um *UndoManager) GetHistory() map[string]interface{} {
	return map[string]interface{}{
		"undoStack": um.UndoStack,
		"redoStack": um.RedoStack,
		"canUndo":   len(um.UndoStack) > 0,
		"canRedo":   len(um.RedoStack) > 0,
		"undoCount": len(um.UndoStack),
		"redoCount": len(um.RedoStack),
	}
}

// GetBatches returns all available batches
func (um *UndoManager) GetBatches() map[string][]UndoAction {
	batches := make(map[string][]UndoAction)

	for _, action := range um.UndoStack {
		if action.Metadata.BatchID != "" {
			batches[action.Metadata.BatchID] = append(batches[action.Metadata.BatchID], action)
		}
	}

	return batches
}

// SaveState saves the undo manager state to disk
func (um *UndoManager) SaveState(filePath string) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(um)
}

// LoadState loads the undo manager state from disk
func (um *UndoManager) LoadState(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	return decoder.Decode(um)
}

// Cleanup removes old backups and clears history
func (um *UndoManager) Cleanup(olderThanDays int) error {
	cutoffTime := time.Now().AddDate(0, 0, -olderThanDays)

	// Remove old actions and their backups
	var newUndoStack []UndoAction
	for _, action := range um.UndoStack {
		if action.Timestamp.After(cutoffTime) {
			newUndoStack = append(newUndoStack, action)
		} else {
			// Remove backup file
			if action.BackupPath != "" {
				os.RemoveAll(action.BackupPath)
			}
		}
	}

	um.UndoStack = newUndoStack

	// Clear redo stack as well
	for _, action := range um.RedoStack {
		if action.BackupPath != "" && action.Timestamp.Before(cutoffTime) {
			os.RemoveAll(action.BackupPath)
		}
	}

	var newRedoStack []UndoAction
	for _, action := range um.RedoStack {
		if action.Timestamp.After(cutoffTime) {
			newRedoStack = append(newRedoStack, action)
		}
	}

	um.RedoStack = newRedoStack

	return nil
}

// Clear removes all undo/redo history
func (um *UndoManager) Clear() error {
	// Remove all backup files
	for _, action := range um.UndoStack {
		if action.BackupPath != "" {
			os.RemoveAll(action.BackupPath)
		}
	}

	for _, action := range um.RedoStack {
		if action.BackupPath != "" {
			os.RemoveAll(action.BackupPath)
		}
	}

	// Clear stacks
	um.UndoStack = make([]UndoAction, 0)
	um.RedoStack = make([]UndoAction, 0)
	um.CurrentBatch = ""

	return nil
}
