import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

// UserItem component to render individual user entries
function UserItem({ user, showApproveButton, onApprove, approvingId, animationDelay }) {
    return (
        <div
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            style={{
                animationDelay: `${animationDelay}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                            {user.email.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {user.email}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v3m4-3a2 2 0 100-4 2 2 0 000 4zm0 0v3" />
                            </svg>
                            Registered on {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
                {showApproveButton && (
                    <AlertDialog>
                        <AlertDialogTrigger
                            disabled={approvingId === user.id}
                            className="relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                            {approvingId === user.id ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                </>
                            )}
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    Approve User Access
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-base leading-relaxed">
                                    Are you sure you want to approve <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>?
                                    This will grant them full access to the platform.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-3">
                                <AlertDialogCancel className="px-6">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onApprove(user.id)}
                                    className="px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                >
                                    Approve User
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}

export default function PendingApprovals() {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/admin/users-summary');
                setPendingUsers(res.data.pending);
                setApprovedUsers(res.data.approved);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleApprove = async (id) => {
        try {
            setApprovingId(id);
            await axios.post('/api/admin/approve-user', { userId: id });
            const user = pendingUsers.find(u => u.id === id);
            if (user) {
                setPendingUsers(p => p.filter(u => u.id !== id));
                setApprovedUsers(a => [user, ...a]);
            }
            toast.success('User approved successfully');
        } catch (error) {
            console.log(error);
            toast.error('Failed to approve user');
        } finally {
            setApprovingId(null);
        }
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="flex justify-between items-center">
                        <div className="space-y-3 flex-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const EmptyState = ({ message }) => (
        <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );

    const title = activeTab === 'pending' ? 'Pending Approvals' : 'Approved Users';
    const description = activeTab === 'pending' ? 'Review and approve new user registrations' : 'List of approved users';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {title}
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {description}
                    </p>
                    {activeTab === 'pending' && !loading && pendingUsers.length > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6">
                    <button
                        className={`px-4 py-2 text-white rounded-lg ${activeTab === 'pending' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`px-4 py-2 text-white rounded-lg ${activeTab === 'approved' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        Approved
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-6">
                            <LoadingSkeleton />
                        </div>
                    ) : activeTab === 'pending' ? (
                        pendingUsers.length === 0 ? (
                            <EmptyState message="No pending user approvals at the moment." />
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingUsers.map((user, index) => (
                                    <UserItem
                                        key={user.id}
                                        user={user}
                                        showApproveButton={true}
                                        onApprove={handleApprove}
                                        approvingId={approvingId}
                                        animationDelay={index * 100}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        approvedUsers.length === 0 ? (
                            <EmptyState message="No approved users yet." />
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {approvedUsers.map((user, index) => (
                                    <UserItem
                                        key={user.id}
                                        user={user}
                                        showApproveButton={false}
                                        animationDelay={index * 100}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}