import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Calendar,
  Settings,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  PlusCircle,
  MinusCircle
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

const EnhancedScheduler = ({ darkMode }) => {
  const { addNotification } = useNotifications()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week')
  const [customColumns, setCustomColumns] = useState([])
  const [customRows, setCustomRows] = useState([])
  const [scheduleData, setScheduleData] = useState({})
  const [editingCell, setEditingCell] = useState(null)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnInputType, setNewColumnInputType] = useState('text')
  const [newColumnPosition, setNewColumnPosition] = useState('end')
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRowName, setNewRowName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadSchedulerData()
  }, [])

  useEffect(() => {
    saveSchedulerData()
  }, [customColumns, customRows, scheduleData])

  const loadSchedulerData = () => {
    const savedColumns = localStorage.getItem('pg-scheduler-columns')
    const savedRows = localStorage.getItem('pg-scheduler-rows')
    const savedData = localStorage.getItem('pg-scheduler-data')

    if (savedColumns) {
      setCustomColumns(JSON.parse(savedColumns))
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
      setCustomColumns(defaultColumns)
    }

    if (savedRows) {
      setCustomRows(JSON.parse(savedRows))
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
      setCustomRows(defaultRows)
    }

    if (savedData) {
      setScheduleData(JSON.parse(savedData))
    }
  }

  const saveSchedulerData = () => {
    localStorage.setItem('pg-scheduler-columns', JSON.stringify(customColumns))
    localStorage.setItem('pg-scheduler-rows', JSON.stringify(customRows))
    localStorage.setItem('pg-scheduler-data', JSON.stringify(scheduleData))
  }

  const addColumn = () => {
    if (!newColumnName.trim()) return

    const newColumn = {
      id: `col-${Date.now()}`,
      name: newColumnName,
      type: 'text',
      inputType: newColumnInputType,
      position: newColumnPosition
    }

    const updatedColumns = [...customColumns, newColumn]
    setCustomColumns(updatedColumns)
    setNewColumnName('')
    setShowAddColumn(false)

    addNotification({
      type: 'scheduler',
      title: 'Column Added',
      message: `"${newColumnName}" column has been added`,
      priority: 'low',
      icon: <PlusCircle className="w-5 h-5" />
    })
  }

  const addRow = () => {
    if (!newRowName.trim()) return

    const newRow = {
      id: `row-${Date.now()}`,
      name: newRowName,
      type: 'custom'
    }

    const updatedRows = [...customRows, newRow]
    setCustomRows(updatedRows)
    setNewRowName('')
    setShowAddRow(false)

    addNotification({
      type: 'scheduler',
      title: 'Row Added',
      message: `"${newRowName}" row has been added`,
      priority: 'low',
      icon: <PlusCircle className="w-5 h-5" />
    })
  }

  const removeColumn = (columnId) => {
    if (customColumns.find(col => col.id === columnId)?.fixed) return

    const updatedColumns = customColumns.filter(col => col.id !== columnId)
    setCustomColumns(updatedColumns)

    const updatedData = { ...scheduleData }
    Object.keys(updatedData).forEach(rowId => {
      delete updatedData[rowId][columnId]
    })
    setScheduleData(updatedData)

    addNotification({
      type: 'scheduler',
      title: 'Column Removed',
      message: 'Column has been removed',
      priority: 'medium',
      icon: <MinusCircle className="w-5 h-5" />
    })
  }

  const removeRow = (rowId) => {
    if (customRows.find(row => row.id === rowId)?.type === 'time') return

    const updatedRows = customRows.filter(row => row.id !== rowId)
    setCustomRows(updatedRows)

    const updatedData = { ...scheduleData }
    delete updatedData[rowId]
    setScheduleData(updatedData)

    addNotification({
      type: 'scheduler',
      title: 'Row Removed',
      message: 'Row has been removed',
      priority: 'medium',
      icon: <MinusCircle className="w-5 h-5" />
    })
  }

  const updateCellData = (rowId, columnId, value) => {
    const updatedData = { ...scheduleData }
    
    if (!updatedData[rowId]) {
      updatedData[rowId] = {}
    }
    
    updatedData[rowId][columnId] = value
    setScheduleData(updatedData)
  }

  const getCellValue = (rowId, columnId) => {
    return scheduleData[rowId]?.[columnId] || ''
  }

  const getWeekDays = () => {
    const week = []
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getMonthColumns = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const columns = [
      { id: 'time', name: 'Time', type: 'time', fixed: true }
    ]
    
    // Add custom columns at start
    const startCustomColumns = customColumns.filter(col => col.position === 'start')
    columns.push(...startCustomColumns)
    
    // Add day columns
    for (let day = 1; day <= daysInMonth; day++) {
      columns.push({
        id: `day-${day}`,
        name: day.toString(),
        type: 'day',
        fixed: true
      })
    }
    
    // Add custom columns at end
    const endCustomColumns = customColumns.filter(col => col.position === 'end')
    columns.push(...endCustomColumns)
    
    return columns
  }

  const renderCell = (row, column) => {
    const cellKey = `${row.id}-${column.id}`
    const isEditing = editingCell === cellKey
    const value = getCellValue(row.id, column.id)

    if (column.type === 'time') {
      return (
        <div className={`p-3 text-center font-medium ${
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.name}
        </div>
      )
    }

    // Handle different input types
    if (column.inputType === 'checkbox' || (column.inputType === 'both' && value === 'checked')) {
      return (
        <div className="p-2 min-h-[60px] flex items-center justify-center">
          <input
            type="checkbox"
            checked={value === 'checked' || value === true}
            onChange={(e) => updateCellData(row.id, column.id, e.target.checked ? 'checked' : '')}
            className="w-5 h-5"
          />
        </div>
      )
    }

    if (column.inputType === 'both') {
      return (
        <div className="p-2 min-h-[60px] space-y-2">
          <input
            type="text"
            value={typeof value === 'object' ? value.text : value || ''}
            onChange={(e) => {
              const currentValue = getCellValue(row.id, column.id)
              const updatedValue = typeof currentValue === 'object' ? currentValue : { text: currentValue || '', checked: false }
              updatedValue.text = e.target.value
              updateCellData(row.id, column.id, updatedValue)
            }}
            className={`w-full p-1 border rounded text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Text..."
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={typeof value === 'object' ? value.checked : false}
              onChange={(e) => {
                const currentValue = getCellValue(row.id, column.id)
                const updatedValue = typeof currentValue === 'object' ? currentValue : { text: currentValue || '', checked: false }
                updatedValue.checked = e.target.checked
                updateCellData(row.id, column.id, updatedValue)
              }}
              className="w-4 h-4"
            />
            <span className="text-xs">Done</span>
          </div>
        </div>
      )
    }

    // Default text input
    if (isEditing) {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => updateCellData(row.id, column.id, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingCell(null)
            }
          }}
          className={`w-full p-2 border rounded text-sm ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          autoFocus
        />
      )
    }

    return (
      <div
        onClick={() => setEditingCell(cellKey)}
        className={`p-2 min-h-[60px] cursor-pointer hover:opacity-80 transition-opacity ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
            : 'bg-white hover:bg-gray-50 border-gray-200'
        } border`}
      >
        <div className="text-sm">
          {value || (
            <span className="text-gray-400">Click to edit...</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } min-h-screen p-6`}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Enhanced Scheduler</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Customizable scheduler with editable rows and columns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddColumn(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Column
            </button>
            <button
              onClick={() => setShowAddRow(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Row
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-lg border p-4 mb-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Scheduler Table */}
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {/* Header */}
            <thead>
              <tr>
                {getMonthColumns().map((column, index) => (
                  <th key={column.id} className={`border border-gray-300 dark:border-gray-600 p-3 text-left font-semibold ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  } ${column.type === 'day' ? 'text-center' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span>{column.name}</span>
                      {!column.fixed && (
                        <button
                          onClick={() => removeColumn(column.id)}
                          className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {customRows.map((row) => (
                <tr key={row.id}>
                  {getMonthColumns().map((column) => (
                    <td key={`${row.id}-${column.id}`} className="border border-gray-300 dark:border-gray-600">
                      <div className="flex items-center">
                        <div className="flex-1">
                          {renderCell(row, column)}
                        </div>
                        {column.id === 'time' && row.type === 'custom' && (
                          <button
                            onClick={() => removeRow(row.id)}
                            className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <X className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Column Modal */}
        <AnimatePresence>
          {showAddColumn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-6 w-96 shadow-xl`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Column
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Column name..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Input Type
                      </label>
                      <select
                        value={newColumnInputType}
                        onChange={(e) => setNewColumnInputType(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="text">Text Only</option>
                        <option value="checkbox">Checkbox Only</option>
                        <option value="both">Text + Checkbox</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Position
                      </label>
                      <select
                        value={newColumnPosition}
                        onChange={(e) => setNewColumnPosition(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="start">Start (Before Days)</option>
                        <option value="end">End (After Days)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addColumn}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false)
                      setNewColumnName('')
                      setNewColumnInputType('text')
                      setNewColumnPosition('end')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Row Modal */}
        <AnimatePresence>
          {showAddRow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-6 w-96 shadow-xl`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Row
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Row name..."
                    value={newRowName}
                    onChange={(e) => setNewRowName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addRow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Add Row
                  </button>
                  <button
                    onClick={() => {
                      setShowAddRow(false)
                      setNewRowName('')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EnhancedScheduler
