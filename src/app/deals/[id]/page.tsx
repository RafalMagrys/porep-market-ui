import { DealDetailPage } from '@/views/deal-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <DealDetailPage dealId={BigInt(id)} />
}
