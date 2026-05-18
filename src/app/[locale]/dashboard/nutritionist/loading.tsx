export default function NutritionistDashboardLoading() {
  return (
    <div className='p-6 space-y-6 animate-pulse'>
      <div className='h-8 w-64 rounded-lg bg-gray-200' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-28 rounded-2xl bg-white shadow-sm' />
        ))}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='h-80 rounded-2xl bg-white shadow-sm' />
        <div className='h-80 rounded-2xl bg-white shadow-sm' />
      </div>
    </div>
  );
}
