import { getJobById } from '@/services/jobs';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface JobPageProps {
    params: {
        id: string;
    };
}

export default async function JobDetailsPage({ params }: JobPageProps) {
    const job = await getJobById(params.id);

    if (!job) {
        notFound();
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <Link href="/jobs" className="text-primary-600 hover:text-primary-700">
                    ← بازگشت به لیست آگهی‌ها
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-gray-600">
                            <span>{job.company.name}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            {job.isRemote && (
                                <>
                                    <span>•</span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm">
                                        دورکاری
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                        {job.isPromoted && (
                            <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded mr-2">
                                ویژه
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">حقوق</div>
                        <div className="font-semibold">
                            {job.salary.min.toLocaleString('fa-IR')} - {job.salary.max.toLocaleString('fa-IR')} {job.salary.currency}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">دسته‌بندی</div>
                        <div>{job.category}</div>
                    </div>

                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">تاریخ انتشار</div>
                        <div>{new Date(job.createdAt).toLocaleDateString('fa-IR')}</div>
                    </div>

                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">تاریخ انقضا</div>
                        <div>{new Date(job.expiresAt).toLocaleDateString('fa-IR')}</div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">شرح شغل</h2>
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {job.description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                {job.skills.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">مهارت‌های مورد نیاز</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link
                        href={`/jobs/${job.id}/apply`}
                        className="block w-full md:w-auto md:inline-block text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        درخواست استخدام
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">درباره {job.company.name}</h2>
                {/* اینجا می‌توانید اطلاعات شرکت را نمایش دهید */}
                <p className="text-gray-600">
                    برای کسب اطلاعات بیشتر درباره این شرکت به صفحه پروفایل شرکت مراجعه کنید.
                </p>
            </div>
        </div>
    );
} 