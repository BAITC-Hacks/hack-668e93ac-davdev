export interface DemoTask {
  id: string
  number: string
  points: number
  weeks: number
  color: string
}

// Display examples only; these are not records from the task API.
export const demoTasks: DemoTask[] = [
  { id: 'booking', number: '01', points: 240, weeks: 4, color: '#d3edaa' },
  { id: 'volunteers', number: '02', points: 180, weeks: 3, color: '#d9d0f2' },
  { id: 'reports', number: '03', points: 320, weeks: 6, color: '#f3dfb5' },
]
