import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Save,
  X,
  Calendar,
  Settings,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Grid3x3
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

const TableScheduler = ({ darkMode }) => {
  const { addNotification } = useNotifications()
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [data, setData] = useState({})
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 })
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const tableRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadTableData()
  }, [])

  useEffect(() => {
    saveTableData()
  }, [columns, rows, data])

  const loadTableData = () => {
    const savedColumns = localStorage.getItem('pg-table-columns')
    const savedRows = localStorage.getItem('pg-table-rows')
    const savedData = localStorage.getItem('pg-table-data')

    if (savedColumns) {
      setColumns(JSON.parse(savedColumns))
    } else {
      const defaultColumns = [
        { id: 'time', name: 'Time', type: 'time', fixed: true },
        { id: 'monday', name: 'Monday', type: 'text' },
        { id: 'tuesday', name: 'Tuesday', type: 'text' },
        { id: 'wednesday', name: 'Wednesday', type: 'text' },
        { id: 'thursday', name: 'Thursday', type: 'text' },
        { id: 'friday', name: 'Friday', type: 'text' },
        { id: 'saturday', name: 'Saturday', type: 'text' },
        { id: 'sunday', name: 'Sunday', type: 'text' }
      ]
      setColumns(defaultColumns)
    }

    if (savedRows) {
      setRows(JSON.parse(savedRows))
    } else {
      const defaultRows = []
      for (let hour = 0; hour < 24; hour++) {
        defaultRows.push({
          id: `time-${hour}`,
          name: `${hour.toString().padStart(2, '0')}:00`,
          type: 'time',
          hour: hour
        })
      }
      setRows(defaultRows)
    }

    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }

  const saveTableData = () => {
    localStorage.setItem('pg-table-columns', JSON.stringify(columns))
    localStorage.setItem('pg-table-rows', JSON.stringify(rows))
    localStorage.setItem('pg-table-data', JSON.stringify(data))
  }

  const addColumn = () => {
    if (!newColumnName.trim()) return

    const newColumn = {
      id: `col-${Date.now()}`,
      name: newColumnName,
      type: 'text'
    }

    setColumns([...columns, newColumn])
    setNewColumnName('')
    setShowAddColumn(false)
    addNotification('Column added successfully', 'success')
  }

  const addRow = () => {
    const newRow = {
      id: `row-${Date.now()}`,
      name: `Row ${rows.length + 1}`,
      type: 'text'
    }

    setRows([...rows, newRow])
    addNotification('Row added successfully', 'success')
  }

  const deleteColumn = (columnId) => {
    if (columns.find(col => col.id === columnId)?.fixed) {
      addNotification('Cannot delete fixed column', 'error')
      return
    }

    setColumns(columns.filter(col => col.id !== columnId))
    addNotification('Column deleted', 'success')
  }

  const deleteRow = (rowId) => {
    setRows(rows.filter(row => row.id !== rowId))
    addNotification('Row deleted', 'success')
  }

  const startEditCell = (rowId, columnId, currentValue) => {
    setEditingCell({ rowId, columnId })
    setEditValue(currentValue || '')
    setSelectedCell({ row: rows.findIndex(r => r.id === rowId), col: columns.findIndex(c => c.id === columnId) })
  }

  const saveEditCell = () => {
    if (!editingCell) return

    const newData = { ...data }
    const cellKey = `${editingCell.rowId}-${editingCell.columnId}`
    newData[cellKey] = editValue
    setData(newData)

    setEditingCell(null)
    setEditValue('')
    addNotification('Cell updated', 'success')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = useCallback((e) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault()
        saveEditCell()
        
        // Move to next cell in row or next row
        const currentColIndex = columns.findIndex(c => c.id === editingCell.columnId)
        const nextColIndex = currentColIndex + 1
        
        if (nextColIndex < columns.length) {
          const nextColumn = columns[nextColIndex]
          const nextValue = data[`${editingCell.rowId}-${nextColumn.id}`] || ''
          startEditCell(editingCell.rowId, nextColumn.id, nextValue)
        } else {
          // Move to first column of next row
          const currentRowIndex = rows.findIndex(r => r.id === editingCell.rowId)
          const nextRowIndex = currentRowIndex + 1
          
          if (nextRowIndex < rows.length) {
            const nextRow = rows[nextRowIndex]
            const firstColumn = columns[0]
            const nextValue = data[`${nextRow.id}-${firstColumn.id}`] || ''
            startEditCell(nextRow.id, firstColumn.id, nextValue)
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault()
        
        if (e.shiftKey) {
          // Shift+Tab - move to previous cell
          const currentColIndex = columns.findIndex(c => c.id === editingCell.columnId)
          const prevColIndex = currentColIndex - 1
          
          if (prevColIndex >= 0) {
            const prevColumn = columns[prevColIndex]
            const prevValue = data[`${editingCell.rowId}-${prevColumn.id}`] || ''
            startEditCell(editingCell.rowId, prevColumn.id, prevValue)
          } else {
            // Move to last column of previous row
            const currentRowIndex = rows.findIndex(r => r.id === editingCell.rowId)
            const prevRowIndex = currentRowIndex - 1
            
            if (prevRowIndex >= 0) {
              const prevRow = rows[prevRowIndex]
              const lastColumn = columns[columns.length - 1]
              const prevValue = data[`${prevRow.id}-${lastColumn.id}`] || ''
              startEditCell(prevRow.id, lastColumn.id, prevValue)
            }
          }
        } else {
          // Tab - move to next cell (same as Enter behavior)
          const currentColIndex = columns.findIndex(c => c.id === editingCell.columnId)
          const nextColIndex = currentColIndex + 1
          
          if (nextColIndex < columns.length) {
            const nextColumn = columns[nextColIndex]
            const nextValue = data[`${editingCell.rowId}-${nextColumn.id}`] || ''
            startEditCell(editingCell.rowId, nextColumn.id, nextValue)
          } else {
            // Move to first column of next row
            const currentRowIndex = rows.findIndex(r => r.id === editingCell.rowId)
            const nextRowIndex = currentRowIndex + 1
            
            if (nextRowIndex < rows.length) {
              const nextRow = rows[nextRowIndex]
              const firstColumn = columns[0]
              const nextValue = data[`${nextRow.id}-${firstColumn.id}`] || ''
              startEditCell(nextRow.id, firstColumn.id, nextValue)
            }
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEdit()
      }
    } else {
      // Navigation when not editing
      if (e.key === 'Enter') {
        e.preventDefault()
        addRow()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        // Navigate through cells without editing
        const { row, col } = selectedCell
        
        if (e.shiftKey) {
          // Shift+Tab - move left
          if (col > 0) {
            setSelectedCell({ row, col: col - 1 })
          } else if (row > 0) {
            setSelectedCell({ row: row - 1, col: columns.length - 1 })
          }
        } else {
          // Tab - move right
          if (col < columns.length - 1) {
            setSelectedCell({ row, col: col + 1 })
          } else if (row < rows.length - 1) {
            setSelectedCell({ row: row + 1, col: 0 })
          }
        }
      } else if (e.key === 'ArrowUp' && selectedCell.row > 0) {
        e.preventDefault()
        setSelectedCell({ row: selectedCell.row - 1, col: selectedCell.col })
      } else if (e.key === 'ArrowDown' && selectedCell.row < rows.length - 1) {
        e.preventDefault()
        setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col })
      } else if (e.key === 'ArrowLeft' && selectedCell.col > 0) {
        e.preventDefault()
        setSelectedCell({ row: selectedCell.row, col: selectedCell.col - 1 })
      } else if (e.key === 'ArrowRight' && selectedCell.col < columns.length - 1) {
        e.preventDefault()
        setSelectedCell({ row: selectedCell.row, col: selectedCell.col + 1 })
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        const row = rows[selectedCell.row]
        const column = columns[selectedCell.col]
        const currentValue = data[`${row.id}-${column.id}`] || ''
        startEditCell(row.id, column.id, currentValue)
      }
    }
  }, [editingCell, columns, rows, data, selectedCell])

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return // Let input elements handle their own key events
      }
      handleKeyDown(e)
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const getCellValue = (rowId, columnId) => {
    return data[`${rowId}-${columnId}`] || ''
  }

  const filteredColumns = columns.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Table Scheduler</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Navigate with Tab/Arrow keys, Edit with Space/Enter, Add rows with Enter
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddColumn(!showAddColumn)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus size={16} />
              Add Column
            </button>
            <button
              onClick={addRow}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Plus size={16} />
              Add Row
            </button>
          </div>
        </div>

        {/* Add Column Form */}
        <AnimatePresence>
          {showAddColumn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-4 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
              }`}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addColumn()}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addColumn}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowAddColumn(false)
                    setNewColumnName('')
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className={`overflow-auto rounded-lg border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`} ref={tableRef}>
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
              <tr>
                {filteredColumns.map((column, index) => (
                  <th
                    key={column.id}
                    className={`px-4 py-3 text-left font-medium border ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    } ${selectedCell.row === -1 && selectedCell.col === index ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.name}</span>
                      {!column.fixed && (
                        <button
                          onClick={() => deleteColumn(column.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id} className={darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                  {filteredColumns.map((column, colIndex) => {
                    const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === column.id
                    const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex
                    const cellValue = getCellValue(row.id, column.id)

                    return (
                      <td
                        key={column.id}
                        className={`px-4 py-2 border cursor-pointer ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
                          isEditing ? 'p-0' : ''
                        }`}
                        onClick={() => {
                          setSelectedCell({ row: rowIndex, col: colIndex })
                          if (!isEditing) {
                            startEditCell(row.id, column.id, cellValue)
                          }
                        }}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEditCell}
                            onKeyDown={(e) => {
                              e.stopPropagation()
                              if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
                                handleKeyDown(e)
                              }
                            }}
                            className={`w-full h-full px-3 py-2 outline-none ${
                              darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                            }`}
                          />
                        ) : (
                          <div className="min-h-[32px] flex items-center">
                            {cellValue || <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Click to edit</span>}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className={`mt-4 p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <h3 className="font-semibold mb-2">Keyboard Shortcuts:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">Tab</kbd> Navigate right</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">Shift+Tab</kbd> Navigate left</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd> Add row / Save & next cell</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd> Edit cell</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">Arrow Keys</kbd> Navigate</div>
            <div><kbd className="px-2 py-1 bg-gray-700 rounded">Escape</kbd> Cancel edit</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableScheduler
