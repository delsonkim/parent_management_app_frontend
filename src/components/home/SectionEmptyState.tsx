interface Props {
  message: string
}

export default function SectionEmptyState({ message }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-surface-dim px-4 py-6 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}
