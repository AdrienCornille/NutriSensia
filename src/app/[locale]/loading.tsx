export default function LocaleLoading() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-cream-100'>
      <div className='flex flex-col items-center gap-4'>
        <div
          className='h-12 w-12 rounded-full border-4 border-ink/10 animate-spin'
          style={{ borderTopColor: 'var(--ns-sage-500)' }}
        />
        <div className='text-sm text-ink/60 font-sans'>Chargement…</div>
      </div>
    </div>
  );
}
