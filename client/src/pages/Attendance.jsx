import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    Calendar, Download, User, Clock, CheckCircle, XCircle, AlertCircle, Search, Plus, Edit, Trash2, Filter,
    TrendingUp, BarChart3, Users, CalendarDays, Timer, X, Save, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const { getToken } = useAuth();
    const { users, currentUser, profileRole } = useApp();
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [showTimes, setShowTimes] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 10),
        checkIn: '10:00',
        checkOut: '19:00', // Updated to 7 PM
        status: 'Present',
        leaveType: '',
        remarks: '',
        overtime: 0,
    });

    useEffect(() => {
        if (profileRole === 'user') {
            setSelectedUser(currentUser._id);
        }
    }, [profileRole, currentUser]);

    const fetchAttendanceData = async () => {
        if (!selectedUser) return;
        const token = await getToken();
        try {
            setLoading(true);
            const response = await fetch(
                `/api/attendance/${selectedUser}?month=${selectedMonth}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setAttendanceData(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            toast.error('Failed to fetch attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUser) fetchAttendanceData();
    }, [selectedUser, selectedMonth]);

    const calculateTotalHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return null;
        const [inHours, inMinutes] = checkIn.split(':').map(Number);
        const [outHours, outMinutes] = checkOut.split(':').map(Number);
        let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle next-day check-out
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}.${Math.round(minutes / 6)}`;
    };

    const calculateOvertime = (checkOut) => {
        if (!checkOut) return 0;
        const standardEnd = '19:00';
        const [stdHours, stdMinutes] = standardEnd.split(':').map(Number);
        const [outHours, outMinutes] = checkOut.split(':').map(Number);
        let overtimeMinutes = (outHours * 60 + outMinutes) - (stdHours * 60 + stdMinutes);
        if (overtimeMinutes <= 0) return 0;
        const overtimeHours = Math.floor(overtimeMinutes / 60);
        const overtimeMinutesPart = overtimeMinutes % 60;
        return `${overtimeHours}.${Math.round(overtimeMinutesPart / 6)}`;
    };

    const handleSaveRecord = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            let totalHours = null;
            let overtime = 0;
            if (formData.status === 'Present' && formData.checkIn && formData.checkOut) {
                totalHours = calculateTotalHours(formData.checkIn, formData.checkOut);
                overtime = calculateOvertime(formData.checkOut);
            }
            const recordData = {
                ...formData,
                employeeId: selectedUser,
                totalHours,
                overtime,
            };
            const url = editingRecord ? `/api/attendance/${editingRecord._id}` : '/api/attendance';
            const method = editingRecord ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(recordData),
            });
            if (!response.ok) throw new Error('Failed to save record');
            await fetchAttendanceData();
            setShowModal(false);
            setEditingRecord(null);
            resetFormData();
        } catch (error) {
            console.error('Error saving record:', error);
            toast.error('Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    const resetFormData = () => {
        setFormData({
            date: new Date().toISOString().slice(0, 10),
            checkIn: '10:00',
            checkOut: '19:00', // Updated to 7 PM
            status: 'Present',
            leaveType: '',
            remarks: '',
            overtime: 0,
        });
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record);
        setFormData({
            date: new Date(record.date).toISOString().slice(0, 10),
            checkIn: record.checkIn || '10:00',
            checkOut: record.checkOut || '19:00', // Updated to 7 PM
            status: record.status,
            leaveType: record.leaveType || '',
            overtime: record.overtime || 0,
            remarks: record.remarks || '',
        });
        setShowModal(true);
    };

    const handleDeleteRecord = async (recordId) => {
        // if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            setLoading(true);
            const token = await getToken();
            const response = await fetch(`/api/attendance/${recordId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete record');
            await fetchAttendanceData();
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete record');
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!attendanceData.length) {
            alert('No data to export');
            return;
        }
        const selectedUserData = users.find(u => u._id === selectedUser);
        const monthYear = new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const excelData = attendanceData.map(record => ({
            Date: new Date(record.date).toLocaleDateString(),
            'Check In': record.checkIn || 'N/A',
            'Check Out': record.checkOut || 'N/A',
            'Total Hours': record.totalHours || 'N/A',
            Status: record.status,
            'Leave Type': record.leaveType || 'N/A',
            Remarks: record.remarks || 'N/A',
            Overtime: record.overtime > 0 ? `${record.overtime}h` : 'N/A',
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        const fileName = `Attendance_${selectedUserData?.firstName}_${selectedUserData?.lastName}_${monthYear.replace(' ', '_')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'Absent': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'Leave': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'Holiday': return <Calendar className="h-4 w-4 text-blue-500" />;
            default: return <Clock className="h-4 w-4 text-slate-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Absent': return 'bg-red-50 text-red-700 border-red-200';
            case 'Leave': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Holiday': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const calculateStats = () => {
        const totalDays = attendanceData.length;
        const presentDays = attendanceData.filter(record => record.status === 'Present').length;
        const absentDays = attendanceData.filter(record => record.status === 'Absent').length;
        const leaveDays = attendanceData.filter(record => record.status === 'Leave').length;
        const holidayDays = attendanceData.filter(record => record.status === 'Holiday').length;
        const totalWorkingHours = attendanceData
            .filter(record => record.totalHours)
            .reduce((sum, record) => sum + parseFloat(record.totalHours || 0), 0);
        return {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            holidayDays,
            totalWorkingHours: totalWorkingHours.toFixed(2),
            attendancePercentage: totalDays > 0 ? ((presentDays / (totalDays - holidayDays)) * 100).toFixed(1) : 0,
        };
    };

    const stats = calculateStats();
    const selectedUserData = users.find(u => u._id === selectedUser);
    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term);
    });

    function formatTime24to12(time24) {
        if (!time24) return '-';
        let [hh, mm] = time24.split(':').map(Number);
        const suffix = hh < 12 ? 'AM' : 'PM';
        const hour12 = hh % 12 || 12;
        return `${hour12}:${mm.toString().padStart(2, '0')} ${suffix}`;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Attendance Management</h1>
                        <p className="text-gray-400 mt-2 text-lg">Track and manage employee attendance with modern insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToExcel}
                            disabled={!attendanceData.length}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export Excel</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {(profileRole === "super-admin" || profileRole === "admin") && (
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Select Employee</label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search employees by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 pr-4 bg-white focus:border-transparent shadow-sm w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Choose an employee</option>
                                    {filteredUsers?.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-3">Select Month</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        {(profileRole === "super-admin" || profileRole === "admin") && (
                            <button
                                onClick={() => setShowModal(true)}
                                disabled={!selectedUser}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Record</span>
                            </button>
                        )}
                    </div>
                </div>
                {selectedUserData && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-4 text-white">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{selectedUserData.firstName} {selectedUserData.lastName}</h3>
                                <p className="">{selectedUserData.email}</p>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mt-1">
                                    {selectedUserData.department}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                {selectedUser && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { label: 'Present', value: stats.presentDays, icon: CheckCircle, color: 'green' },
                            { label: 'Absent', value: stats.absentDays, icon: XCircle, color: 'red' },
                            { label: 'Leave', value: stats.leaveDays, icon: AlertCircle, color: 'yellow' },
                            { label: 'Holidays', value: stats.holidayDays, icon: Calendar, color: 'blue' },
                            { label: 'Total Hours', value: `${stats.totalWorkingHours}h`, icon: Timer, color: 'purple' },
                            { label: 'Attendance', value: `${stats.attendancePercentage}%`, icon: TrendingUp, color: 'indigo' },
                        ].map((stat, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-800 text-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`h-10 w-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                                        <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}
                {selectedUser && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl text-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">
                                    Attendance Records - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 " />
                                    <span className="text-sm">{attendanceData.length} records</span>
                                </div>
                            </div>
                        </div>
                        {loading ? (
                            <div className="p-8">
                                <div className="animate-pulse space-y-4">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="h-14 bg-slate-200 rounded-lg"></div>
                                    ))}
                                </div>
                            </div>
                        ) : attendanceData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Check In</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Check Out</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Total Hours</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Overtime</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Remarks</th>
                                            {(profileRole === "super-admin" || profileRole === "admin") && (
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {attendanceData.map((record, index) => (
                                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium">
                                                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                                                        {getStatusIcon(record.status)}
                                                        <span className="ml-2">{record.status}</span>
                                                        {record.status === 'Leave' && record.leaveType && <span className="ml-1">({record.leaveType})</span>}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatTime24to12(record.checkIn) || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatTime24to12(record.checkOut) || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {record.status === 'Present' && record.totalHours ? `${record.totalHours}h` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm max-w-xs truncate">
                                                    {record.status === 'Present' && record.overtime > 0 ? `${record.overtime}h` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm max-w-xs truncate">{record.remarks || record.leaveType || '-'}</td>
                                                {(profileRole === "super-admin" || profileRole === "admin") && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditRecord(record)}
                                                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            {/* <button
                                                                onClick={() => handleDeleteRecord(record._id)}
                                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button> */}
                                                            <AlertDialog className="dark:bg-gray-800">
                                                                <AlertDialogTrigger className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete your Project
                                                                            and remove your data from our servers.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteRecord(record._id)}
                                                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Attendance Data</h3>
                                <p className="text-slate-500">No attendance records found for the selected month.</p>
                            </div>
                        )}
                    </div>
                )}
                {!selectedUser && (
                    <div className="text-center py-16">
                        <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-12 w-12 text-white" />
                        </div>
                        {(profileRole === "super-admin" || profileRole === "admin") ?
                            <>
                                <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">Select an Employee</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg">Choose an employee to view their attendance records and insights.</p>
                            </>
                            : <>
                                <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">Attendance History</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg">View your attendance records and insights.</p>
                            </>
                        }
                    </div>
                )}
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">{editingRecord ? 'Edit Attendance' : 'Add Attendance'}</h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetFormData();
                                    }}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 border dark:bg-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        status: e.target.value,
                                        checkIn: e.target.value === 'Present' ? '10:00' : '',
                                        checkOut: e.target.value === 'Present' ? '19:00' : '',
                                    })}
                                    className="w-full px-4 py-3 border dark:bg-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                    <option value="Holiday">Holiday</option>
                                </select>
                            </div>
                            {formData.status === 'Leave' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Leave Type</label>
                                    <select
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                        className="w-full px-4 py-3 border dark:bg-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Leave Type</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Vacation">Vacation</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                            )}
                            {formData.status === 'Present' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium">Time Details</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowTimes(!showTimes)}
                                            className="text-blue-600 text-sm flex items-center"
                                        >
                                            {showTimes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                            {showTimes ? 'Hide Times' : 'Show Times'}
                                        </button>
                                    </div>
                                    {showTimes && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Check In</label>
                                                <input
                                                    type="time"
                                                    value={formData.checkIn}
                                                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                                    className="w-full px-4 py-3 border dark:bg-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Check Out</label>
                                                <input
                                                    type="time"
                                                    value={formData.checkOut}
                                                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                                    className="w-full px-4 py-3 border dark:bg-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-2">Remarks</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Add any additional notes..."
                                    rows="3"
                                    className="w-full px-4 py-3 border dark:bg-gray-800 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetFormData();
                                }}
                                className="px-6 py-2 border rounded-md hover:bg-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRecord}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                <Save className="h-4 w-4" />
                                <span>{loading ? 'Saving...' : (editingRecord ? 'Update' : 'Save')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;