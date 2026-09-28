import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRandom } from '../api'
import { ErrorBox } from '../components'
import { RecipeView } from './RecipePage'
export default function RandomPage() {
  const [round, setRound] = useState(0)
  const { data, isFetching, isError, error, refetch } = useQuery({ queryKey: ['random', round], queryFn: fetchRandom, staleTime: Infinity })
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-secondary">วันนี้กินอะไรดี?</h1><button className="btn btn-secondary rounded-full" onClick={() => setRound((r) => r + 1)} disabled={isFetching}>สุ่มเมนูใหม่</button></div>
      {isFetching ? <div className="flex flex-col gap-3" aria-busy="true"><div className="skeleton h-72 w-full" /><div className="skeleton h-6 w-1/2" /></div>
        : isError ? <ErrorBox message={error.message} onRetry={() => void refetch()} /> : data && <RecipeView meal={data} />}
    </div>
  )
}
