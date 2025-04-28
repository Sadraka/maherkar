import { getJobs } from '@/services/jobs';
import Link from 'next/link';

export default async function JobsPage() {
    const jobsResponse = await getJobs();
    const jobs = jobsResponse?.data || [];
    const total = jobsResponse?.total || 0;

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">آگهی‌های شغلی</h1>
                <p className="text-gray-500 mt-2 md:mt-0">
                    {total} آگهی شغلی یافت شد
                </p>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">هیچ آگهی شغلی یافت نشد</p>
                    <p className="text-sm text-gray-400">
                        لطفاً بعداً دوباره بررسی کنید یا معیارهای جستجو را تغییر دهید
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job) => (
                        <Link href={`/jobs/${job.id}`} key={job.id} className="block">
                            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {job.title}
                                    </h2>
                                    {job.isPromoted && (
                                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                                            ویژه
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center text-gray-600 mb-2">
                                    <span className="text-sm">{job.company.name}</span>
                                </div>

                                <div className="flex items-center text-gray-500 text-sm mb-3">
                                    <span className="ml-4">{job.location}</span>
                                    {job.isRemote && (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                            دورکاری
                                        </span>
                                    )}
                                </div>

                                {job.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {job.skills.slice(0, 3).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {job.skills.length > 3 && (
                                            <span className="text-xs text-gray-500">
                                                +{job.skills.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                    <div className="text-primary-600 font-medium">
                                        {job.salary.min.toLocaleString('fa-IR')} - {job.salary.max.toLocaleString('fa-IR')} {job.salary.currency}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(job.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 