export type WeeklySeries = {
  name: string
  data: number[]
}

export type WeeklyHistoryPayload = {
  categories: string[]
  series: WeeklySeries[]
}

