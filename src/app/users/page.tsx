import { getTopJobSeekers } from '@/services/users';

export default async function UsersPage() {
    const usersResponse = await getTopJobSeekers();
    const users = usersResponse?.data || [];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">لیست کارجویان برتر</h1>

            {users.length === 0 ? (
                <p>هیچ کارجویی یافت نشد</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                        <div key={user.id} className="border p-4 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold">{user.full_name}</h2>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm mt-2">{user.phone}</p>
                            {user.skills && user.skills.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-1">مهارت‌ها:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {user.skills.map((skill, index) => (
                                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 